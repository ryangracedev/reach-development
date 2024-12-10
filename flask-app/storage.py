import os
from flask import current_app
from werkzeug.utils import secure_filename

# Optional: Uncomment these lines if/when you integrate AWS S3
# import boto3
# from botocore.exceptions import NoCredentialsError

def save_file_local(file):
    """Save the file locally and return the URL."""
    print("[save_file_local]: Saving photo")
    upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
    os.makedirs(upload_folder, exist_ok=True)  # Create the folder if it doesn't exist
    filename = secure_filename(file.filename)  # Sanitize the filename
    file_path = os.path.join(upload_folder, filename)
    file.save(file_path)  # Save the file to the local filesystem
    print("[save_file_local]: filename: ", filename)
    return f"/uploads/{filename}"  # Return the relative path for the client

def save_file_s3(file):
    """Save the file to AWS S3 and return the URL."""
    # Uncomment and configure this when you have an S3 bucket
    # s3_client = boto3.client(
    #     's3',
    #     aws_access_key_id=current_app.config.get('AWS_ACCESS_KEY'),
    #     aws_secret_access_key=current_app.config.get('AWS_SECRET_KEY')
    # )
    # bucket_name = current_app.config.get('S3_BUCKET_NAME')
    # filename = secure_filename(file.filename)
    # try:
    #     s3_client.upload_fileobj(file, bucket_name, filename)
    #     return f"https://{bucket_name}.s3.amazonaws.com/{filename}"
    # except NoCredentialsError:
    #     raise RuntimeError("AWS credentials are not configured.")
    pass  # Placeholder until you configure AWS S3

def save_file(file):
    """Save the file based on the environment (development or production)."""
    environment = current_app.config.get('ENV', 'development')  # Default to 'development'
    if environment == 'production':
        return save_file_s3(file)  # Save to S3 in production
    return save_file_local(file)  # Save locally in development

