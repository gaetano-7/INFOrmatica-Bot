#app/services/anythingLLM.py
import requests
import json
from fastapi import Depends, UploadFile
from datetime import datetime
from app.database import crud
from sqlalchemy.orm import Session
from app.database.config import get_db


def create_user(API_KEY, USERNAME, PASSWORD):
    url = 'http://localhost:3001/api/v1/admin/users/new'

    headers = {
        'accept': 'application/json',
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    }

    payload = {
        'username': f'{USERNAME}',
        'password': f'{PASSWORD}',
        'role': 'default'
    }
    
    response = requests.post(url, headers=headers, data=json.dumps(payload))

    response_json = response.json()

    user_id = response_json.get('user', {}).get('id')

    return user_id

def get_token(USERNAME, PASSWORD):
    url = "http://localhost:3001/api/request-token"

    headers = {
        "Host": "localhost:3001",
        'Accept': '*/*',
        'Referer': 'http://localhost:3001/login?nt=1',
        "Content-Type": "text/plain;charset=UTF-8",
        "Origin": "http://localhost:3001",
        "Connection": "keep-alive",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        }

    payload = {
        'username': f'{USERNAME}',
        'password': f'{PASSWORD}',
    }

    r = requests.post(url, headers=headers, data=json.dumps(payload))

    response_json = r.json()

    token = response_json.get('token')

    return token

def add_user_to_workspace(users_ids, API_KEY):
    url = f'http://localhost:3001/api/v1/admin/workspaces/1/update-users'

    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "userIds": users_ids
    }

    r = requests.post(url, headers=headers, data=json.dumps(payload))

def get_users_ids(API_KEY):
    url = 'http://localhost:3001/api/v1/admin/users'
    
    headers = {
        'accept': 'application/json',
        'Authorization': f'Bearer {API_KEY}'
    }
    
    response = requests.get(url, headers=headers)
    
    if response.status_code != 200:
        raise Exception("Failed to retrieve users")
    
    response_json = response.json()
    user_ids = [user['id'] for user in response_json['users']]
    
    return user_ids

def remove_user(user_id, API_KEY):
    url = f'http://localhost:3001/api/v1/admin/users/{user_id}'

    headers = {
        'accept': 'application/json',
        'Authorization': f'Bearer {API_KEY}'
    }

    response = requests.delete(url, headers=headers)

def question(message, API_KEY):
    url = 'http://localhost:3001/api/workspace/informatica-bot/stream-chat'
    headers = {
        'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7,es;q=0.6,zh-CN;q=0.5,zh-TW;q=0.4,zh;q=0.3,cs;q=0.2',
        'Authorization': f'Bearer {API_KEY}',
        'Connection': 'keep-alive',
        'Content-Type': 'text/plain;charset=UTF-8',
        'Cookie': 'Idea-2aa665c8=8e9eef7d-da25-43c3-9a6e-4b807fa944d0; __stripe_mid=4137c64c-e905-4136-8b01-864c9f5fbf614e6f48; g_state={"i_l":0}; Idea-2aa665c9=2eb0820e-4c92-4ba1-ab5e-65c29626a7d9',
        'Origin': 'http://localhost:3001',
        'Referer': 'http://localhost:3001/workspace/informatica-bot',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'accept': 'text/event-stream',
        'sec-ch-ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"'
    }
    current_date = datetime.now()
    data = {
        'message': f"date: {current_date}, question: {message}"
    }

    response = requests.post(url, headers=headers, json=data)
    ai_response = response.text
    parsed_response = parse_response(ai_response)

    return parsed_response

def question_verified(user_id, message, API_KEY, db: Session = Depends(get_db)):
    url = 'http://localhost:3001/api/workspace/informatica-bot/stream-chat'
    headers = {
        'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7,es;q=0.6,zh-CN;q=0.5,zh-TW;q=0.4,zh;q=0.3,cs;q=0.2',
        'Authorization': f'Bearer {API_KEY}',
        'Connection': 'keep-alive',
        'Content-Type': 'text/plain;charset=UTF-8',
        'Cookie': 'Idea-2aa665c8=8e9eef7d-da25-43c3-9a6e-4b807fa944d0; __stripe_mid=4137c64c-e905-4136-8b01-864c9f5fbf614e6f48; g_state={"i_l":0}; Idea-2aa665c9=2eb0820e-4c92-4ba1-ab5e-65c29626a7d9',
        'Origin': 'http://localhost:3001',
        'Referer': 'http://localhost:3001/workspace/informatica-bot',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'accept': 'text/event-stream',
        'sec-ch-ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"'
    }
    current_date = datetime.now()
    data = {
        'message': f"date: {current_date}, question: {message}"
    }

    response = requests.post(url, headers=headers, json=data)
    ai_response = response.text

    parsed_response = parse_response(ai_response)

    user_response = crud.create_chat_verified(db, user_id, message, parsed_response)

    return user_response


def get_chat_history(API_KEY):
    url = "http://localhost:3001/api/v1/workspace/informatica-bot/chats"

    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }

    response = requests.get(url, headers=headers)

    return response

def get_documents(API_KEY):
    url = 'http://localhost:3001/api/v1/documents'
    
    headers = {
        'accept': 'application/json',
        'Authorization': f'Bearer {API_KEY}'
    }
    
    response = requests.get(url, headers=headers)
    
    def extract_file_names_and_titles(data):
        def recursive_extract(items):
            files = []
            for item in items:
                if item['type'] == 'file':
                    files.append({'name': item['name'], 'title': item['title']})
                elif item['type'] == 'folder':
                    files.extend(recursive_extract(item['items']))
            return files

        return recursive_extract(data['localFiles']['items'])

    response_json = response.json()
    filtered_files = extract_file_names_and_titles(response_json)
    
    return filtered_files

def delete_all_workspace_chats(api_key: str):
    url = 'http://localhost:3001/api/system/workspace-chats/-1'
    
    headers = {
        'Accept': '*/*',
        'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7,es;q=0.6,zh-CN;q=0.5,zh-TW;q=0.4,zh;q=0.3,cs;q=0.2',
        'Authorization': f'Bearer {api_key}',
        'Connection': 'keep-alive',
        'Cookie': 'Idea-2aa665c8=8e9eef7d-da25-43c3-9a6e-4b807fa944d0; __stripe_mid=4137c64c-e905-4136-8b01-864c9f5fbf614e6f48; g_state={"i_l":0}; Idea-2aa665c9=2eb0820e-4c92-4ba1-ab5e-65c29626a7d9',
        'Origin': 'http://localhost:3001',
        'Referer': 'http://localhost:3001/settings/workspace-chats',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'sec-ch-ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"'
    }

    response = requests.delete(url, headers=headers)

    if response.status_code != 200:
        raise Exception("Failed to delete all workspace chats")

    return response.json()

def add_embeddings(api_key, document_path):
    url = 'http://localhost:3001/api/v1/workspace/informatica-bot/update-embeddings'
    
    headers = {
        'accept': 'application/json',
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    
    payload = {
        'adds': [document_path]
    }
    
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    
    if response.status_code != 200:
        raise Exception("Failed to update embeddings")
    
    return response.json()


def upload_document(api_key, file: UploadFile):
    url = 'http://localhost:3001/api/v1/document/upload'
    
    headers = {
        'accept': 'application/json',
        'Authorization': f'Bearer {api_key}'
    }
    
    files = {
        'file': (file.filename, file.file, file.content_type)
    }
    
    response = requests.post(url, headers=headers, files=files)
    
    if response.status_code != 200:
        raise Exception("Failed to upload document")
    
    response_json = response.json()
    document_location = response_json.get('documents', [{}])[0].get('location')
    
    return document_location

def upload_document_link(api_key, link):
    url = 'http://localhost:3001/api/v1/document/upload-link'
    
    headers = {
        'accept': 'application/json',
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    
    payload = {
        'link': link
    }
    
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    
    if response.status_code != 200:
        raise Exception("Failed to upload document link")
    
    response_json = response.json()
    document_location = response_json.get('documents', [{}])[0].get('location')
    
    return document_location

def remove_embeddings(api_key, document_path):
    url = 'http://localhost:3001/api/v1/workspace/informatica-bot/update-embeddings'
    
    headers = {
        'accept': 'application/json',
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    
    payload = {
        'deletes': [f"custom-documents/{document_path}"]
    }
    
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    
    if response.status_code != 200:
        raise Exception("Failed to remove embeddings")
    
    return "True"

def remove_document(api_key, document_path):
    url = "http://localhost:3001/api/system/remove-documents"
    
    # Intestazioni della richiesta
    headers = {
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7,es;q=0.6,zh-CN;q=0.5,zh-TW;q=0.4,zh;q=0.3,cs;q=0.2",
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json;charset=UTF-8",
        "Connection": "keep-alive",
        "Host": "localhost:3001",
        "Origin": "http://localhost:3001",
        "Referer": "http://localhost:3001/workspace/informatica-bot",
        "Sec-Ch-Ua": "\"Google Chrome\";v=\"125\", \"Chromium\";v=\"125\", \"Not.A/Brand\";v=\"24\"",
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": "\"Windows\"",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
    }

    # Corpo della richiesta
    data = {
        "names": [f"custom-documents/{document_path}"]
    }

    response = requests.delete(url, headers=headers, data=json.dumps(data))

    if response.status_code != 200:
        raise Exception("Failed to delete document")
    
    return "True"

def parse_response(response: str) -> str:
    parts = response.split('\n\n')
    combined_response = ''

    for part in parts:
        if part.startswith('data: '):
            json_string = part[6:].strip()
            if json_string:
                try:
                    json_data = json.loads(json_string)
                    if 'textResponse' in json_data:
                        combined_response += json_data['textResponse']
                    else:
                        print(f'No textResponse in JSON: {json_data}')
                except json.JSONDecodeError as error:
                    print(f'Error parsing response part: {json_string}', error)
            else:
                print(f'Empty JSON string: {part}')

    return combined_response