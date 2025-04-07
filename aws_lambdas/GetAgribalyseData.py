import json
import requests
import pandas as pd
import numpy as np
import pymysql
import copy

endpoint = 'db-ciqual-2020.c30gseq0osqg.eu-west-3.rds.amazonaws.com'
username = 'admin'
password = 'ciqual20&'
database_name = 'ciqual'

def processEvent(event):
    # Get ingredients list from the event
    nb_entries = len(event)
    print(nb_entries, str(nb_entries % 3))
    if(nb_entries % 3 != 0):
        return {
            'statusCode': 400,
            'error': 'exception',
            'errorMessage': 'The input type is incorrect'
        }
    
    nb_ingredients = nb_entries // 3
    ingredients_dict = {}
    for i in range(1,nb_ingredients+1):
        name = event['ingredient'+str(i)]
        qty = event['quantity'+str(i)]
        unit = event['unit'+str(i)]
        ingredients_dict[name] = [qty, unit]

    sorted_ingredients_dict = dict(sorted(ingredients_dict.items()))
    return sorted_ingredients_dict

def getAgribalyseData(ciqual_code_ls, ingredients_dict):
    # Gets Agribalyse data for each ingredient contained in the list of ciqual codes input
    # Using a GET http request from Agribalyse API

    column_num_names = ['Score_unique_EF','Changement_climatique']

    url_base = 'https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/lines'
    url_select_left = "?select=Code_CIQUAL%2CCode_AGB%2CNom_du_Produit_en_Fran%C3%A7ais%2CLCI_Name%2CScore_unique_EF%2CChangement_climatique%2CDQR&q="
    url_select_right = "&q_mode=simple&q_fields=Code_AGB"
    url_select_ls = [url_select_left + str(round(ciqual_code)) + url_select_right for ciqual_code in ciqual_code_ls]
    responses = [requests.get(url_base+url_select) for url_select in url_select_ls]
    outputs = [response.json() for response in responses]
    outputs_df = [pd.DataFrame(output['results']) for output in outputs]
    agg_output_df = pd.concat(outputs_df)
    agg_output_df.set_index('Nom_du_Produit_en_Français', inplace=True)
    agg_output_df = agg_output_df.sort_index()

    # Add quantity and unit informations
    agg_output_df['Quantity'] = pd.to_numeric([float(qty_unit[0]) for name, qty_unit in ingredients_dict.items()], errors='coerce')
    agg_output_df['Unit'] = [str(qty_unit[1]) for name, qty_unit in ingredients_dict.items()]
    agg_output_df[column_num_names] = agg_output_df[column_num_names].multiply(agg_output_df['Quantity']/1000, axis="index")
    agg_output_df['QuantityUnit'] = [str(round(qty))+str(unit) for qty,unit in zip(agg_output_df['Quantity'], agg_output_df['Unit'])]

    # Add total row based on whole recipe, add a label, append as a new row
    total_row = agg_output_df.sum(numeric_only=True).to_frame().T
    total_row['Nom_du_Produit_en_Français'] = 'Total'
    total_row['DQR'] = agg_output_df['DQR'].max() # DQR for the whole recipe is the max of its ingredients
    total_row['QuantityUnit'] = str(round(agg_output_df['Quantity'].sum()))+'g' #TODO review unit=ml and conversion from g to ml for each ingredient ...
    total_row.set_index('Nom_du_Produit_en_Français', inplace=True)
    agg_output_df = pd.concat([agg_output_df, total_row], ignore_index=False)
    agg_output_df = agg_output_df.round(2)

    return agg_output_df

def getCiqualData(ingredients_dict):
    # Gets Ciqual data from AWS RDS hosted MySQL database for all ingredients listed
    # Using pymysql library
    
    column_names = ["alim_nom_fr","alim_code","Energie, N x facteur Jones, avec fibres  (kcal/100 g)","Protéines, N x facteur de Jones (g/100 g)","Glucides (g/100 g)","Lipides (g/100 g)","Sucres (g/100 g)","Fibres alimentaires (g/100 g)","AG saturés (g/100 g)","AG monoinsaturés (g/100 g)","AG polyinsaturés (g/100 g)"]
    column_num_names_per100 = ["Energie, N x facteur Jones, avec fibres  (kcal/100 g)","Protéines, N x facteur de Jones (g/100 g)","Glucides (g/100 g)","Lipides (g/100 g)","Sucres (g/100 g)","Fibres alimentaires (g/100 g)","AG saturés (g/100 g)","AG monoinsaturés (g/100 g)","AG polyinsaturés (g/100 g)"]
    column_num_names = ["Energie (kcal)","Protéines (g)","Glucides (g)","Lipides (g)","Sucres (g)","Fibres alimentaires (g)","AG saturés (g)","AG monoinsaturés (g)","AG polyinsaturés (g)"]
    column_mapping = dict(zip(column_num_names_per100,column_num_names))

    # Query nutritional information from ciqual db and adjust information based on quantity per ingredient
    connection = pymysql.connect(host=endpoint, user=username, password=password, db=database_name)
    cursor = connection.cursor()
    ingredientsListStr = '","'.join(ingredients_dict.keys())
    query = 'SELECT alim_nom_fr, alim_code, `Energie, N x facteur Jones, avec fibres  (kcal/100 g)`,`Protéines, N x facteur de Jones (g/100 g)`,`Glucides (g/100 g)`,`Lipides (g/100 g)`,`Sucres (g/100 g)`,`Fibres alimentaires (g/100 g)`,`AG saturés (g/100 g)`,`AG monoinsaturés (g/100 g)`,`AG polyinsaturés (g/100 g)`'
    query += ' FROM ciqual.Ciqual_2020_FR'
    query += f' WHERE alim_nom_fr IN ("{ingredientsListStr}")'
    cursor.execute(query)
    ciqualtable = cursor.fetchall()
    ciqualtable_df = pd.DataFrame([{column_names[index]: column for index, column in enumerate(value)} for value in ciqualtable])
    ciqualtable_df.set_index('alim_nom_fr', inplace=True)
    ciqualtable_df = ciqualtable_df.sort_index()
    cursor.close()
    connection.close()

    # Replace patterns with NaN and force values to be numeric
    patterns_to_replace = ['-','traces', r'<']
    ciqualtable_df[column_num_names_per100] = ciqualtable_df[column_num_names_per100].replace(patterns_to_replace, np.nan, regex=True)
    ciqualtable_df[column_num_names_per100] = ciqualtable_df[column_num_names_per100].replace(',', '.', regex=True)
    ciqualtable_df[column_num_names_per100] = ciqualtable_df[column_num_names_per100].apply(pd.to_numeric, errors='coerce')
    
    # Add quantity and unit informations
    ciqualtable_df['Quantity'] = pd.to_numeric([float(qty_unit[0]) for name, qty_unit in ingredients_dict.items()], errors='coerce')
    ciqualtable_df['Unit'] = [str(qty_unit[1]) for name, qty_unit in ingredients_dict.items()]
    ciqualtable_df[column_num_names_per100] = ciqualtable_df[column_num_names_per100].multiply(ciqualtable_df['Quantity']/100, axis="index")
    ciqualtable_df['QuantityUnit'] = [str(round(qty))+str(unit) for qty,unit in zip(ciqualtable_df['Quantity'], ciqualtable_df['Unit'])]
    ciqualtable_df.rename(columns=column_mapping, inplace=True)
    
    # Add total row based on sum of all ingredients, add a label for the total row in the first column, append the sum as a new row
    total_row = ciqualtable_df.sum(numeric_only=True).to_frame().T
    total_row['alim_nom_fr'] = 'Total'
    total_row['QuantityUnit'] = str(round(ciqualtable_df['Quantity'].sum()))+'g' #TODO review unit=ml and conversion from g to ml for each ingredient ...
    total_row.set_index('alim_nom_fr', inplace=True)
    ciqualtable_df = pd.concat([ciqualtable_df, total_row], ignore_index=False)
    ciqualtable_df = ciqualtable_df.round()

    return ciqualtable_df

def lambda_handler(event, context):

    ingredients_dict = processEvent(event)
    print('ingredients_dict \n', ingredients_dict)

    ciqual_df = getCiqualData(ingredients_dict)
    ciqual_code_ls = ciqual_df['alim_code'][:-1].to_list()
    print('ciqual_df \n', ciqual_df)
    ciqual_json_str = ciqual_df.to_json(orient='index')

    print('ciqual_code_ls \n', ciqual_code_ls)
    agribalyse_df = getAgribalyseData(ciqual_code_ls, ingredients_dict)
    print('agribalyse_df \n', agribalyse_df)
    agribalyse_json_str = agribalyse_df.to_json(orient='index')

    results_df = {'ciqual':ciqual_json_str, 'agribalyse': agribalyse_json_str}

    return {
        'statusCode': 200,
        'body': json.dumps(results_df)
    }
