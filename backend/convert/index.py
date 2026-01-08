import json
import base64
from io import BytesIO
from PIL import Image


def handler(event: dict, context) -> dict:
    '''Конвертация изображений между форматами PNG, JPG, WEBP, GIF, BMP'''
    method = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }

    try:
        body = json.loads(event.get('body', '{}'))
        file_data = body.get('file')
        target_format = body.get('format', '').upper()
        filename = body.get('filename', 'converted')

        if not file_data or not target_format:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Missing file or format'}),
                'isBase64Encoded': False
            }

        if target_format not in ['PNG', 'JPG', 'JPEG', 'WEBP', 'GIF', 'BMP']:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': f'Unsupported format: {target_format}'}),
                'isBase64Encoded': False
            }

        # Декодируем base64
        if ',' in file_data:
            file_data = file_data.split(',')[1]
        
        image_bytes = base64.b64decode(file_data)
        
        # Открываем изображение
        img = Image.open(BytesIO(image_bytes))
        
        # Конвертируем в RGB если нужно (для JPG)
        if target_format in ['JPG', 'JPEG'] and img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background

        # Сохраняем в новом формате
        output = BytesIO()
        save_format = 'JPEG' if target_format == 'JPG' else target_format
        
        if save_format == 'JPEG':
            img.save(output, format=save_format, quality=95, optimize=True)
        elif save_format == 'PNG':
            img.save(output, format=save_format, optimize=True)
        else:
            img.save(output, format=save_format)
        
        # Кодируем результат в base64
        output.seek(0)
        converted_base64 = base64.b64encode(output.read()).decode('utf-8')
        
        # Определяем MIME type
        mime_types = {
            'PNG': 'image/png',
            'JPG': 'image/jpeg',
            'JPEG': 'image/jpeg',
            'WEBP': 'image/webp',
            'GIF': 'image/gif',
            'BMP': 'image/bmp'
        }
        
        new_filename = filename.rsplit('.', 1)[0] + '.' + target_format.lower()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'file': f"data:{mime_types[target_format]};base64,{converted_base64}",
                'filename': new_filename,
                'format': target_format
            }),
            'isBase64Encoded': False
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
