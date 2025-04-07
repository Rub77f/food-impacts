import json
import pymysql
import requests
import pandas as pd

endpoint = 'db-ciqual-2020.c30gseq0osqg.eu-west-3.rds.amazonaws.com'
username = 'admin'
password = 'ciqual20&'
database_name = 'ciqual'

def getCiqualAvailableIngredients():
    # Check available ingredients in the Ciqual database
    connection = pymysql.connect(host=endpoint, user=username, password=password, db=database_name)
    cursor = connection.cursor()
    cursor.execute("SELECT distinct alim_nom_fr FROM ciqual.Ciqual_2020_FR WHERE alim_grp_nom_fr IN ('fruits, légumes, légumineuses et oléagineux','produits céréaliers','viandes, œufs, poissons et assimilés','produits laitiers et assimilés','matières grasses','aides culinaires et ingrédients divers')")
    rows = cursor.fetchall()
    ingredients = [rows[i][0] for i in range(len(rows))]
    cursor.close()
    connection.close()

    return ingredients

def getAgribalyseAvailableIngredients():
    # Check available ingredients in the Agribalyse database
    url_base = "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese/full"
    response = requests.get(url_base)
    all_text = response.text

    # Clean up typos in db
    all_text = all_text.replace('"','')
    all_text = all_text.replace('Bière sans alcool (<1,2° alcool)','Bière sans alcool (<1, 2° alcool)')
    all_text = all_text.replace('Beer, alcohol-free (<1,2° alcohol)','Beer, alcohol-free (<1, 2° alcohol)')
    all_text = all_text.replace('Savoury cake (with cheese, vegetables, meat, fish, poultry,etc.)','Savoury cake (with cheese, vegetables, meat, fish, poultry, etc.)')
    all_text = all_text.replace('Duck with sauce (green pepper sauce, hunter-style sauce,etc.)','Duck with sauce (green pepper sauce, hunter-style sauce, etc.)')
    all_text = all_text.replace('Rice, mix of species (white, wholegrain, wild, red,etc.), raw','Rice, mix of species (white, wholegrain, wild, red, etc.), raw')
    all_text = all_text.replace('Poule, viande ,crue','Poule, viande, crue')

    all_text_ls = all_text.split('\n')

    data = []
    for row_text in all_text_ls:
        row_ls = row_text.replace(', ', '!').split(',')
        row_ls = [item.replace('!', ', ') for item in row_ls]
        if(len(row_ls)!=32):
            print('error for row=', row_ls)
        else:
            data.append(row_ls)

    data_df = pd.DataFrame(data[1:], columns = data[0])
    #print('Nb agribalyse ing before filtering', data_df.shape[0])
    group_filter = data_df["Groupe d'aliment"].isin(['fruits, légumes, légumineuses et oléagineux','produits céréaliers','viandes, œufs, poissons','lait et produits laitiers','matières grasses','aides culinaires et ingrédients divers'])
    data_filter_df = data_df[group_filter].copy(deep=True)
    #print('Nb agribalyse ing after filtering', data_filter_df.shape[0])

    return data_filter_df['Nom du Produit en Français']

def lambda_handler(event, context):

    if(event['type']=='all'):
        ciqual_av_ls = getCiqualAvailableIngredients()
        print('Nb ciqual ing', len(ciqual_av_ls))

        agribalyse_av_ls = getAgribalyseAvailableIngredients()
        print('Nb agribalyse ing', len(agribalyse_av_ls))

        # Intersection of lists
        joint_av_ingredients_ls = list(set(ciqual_av_ls) & set(agribalyse_av_ls))
        print('Nb joint ing', len(joint_av_ingredients_ls))

        return {
            'statusCode': 200,
            'body': json.dumps(joint_av_ingredients_ls)
        }
    else:
        return {
            'statusCode': 400,
            'error': 'exception',
            'errorMessage': 'The input type is incorrect'
        }
