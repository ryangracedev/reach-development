import os
import boto3
from flask import current_app
from werkzeug.utils import secure_filename
from botocore.exceptions import NoCredentialsError, ClientError

# Optional: Uncomment these lines if/when you integrate AWS S3
# import boto3
# from botocore.exceptions import NoCredentialsError

# Save the file locally and return the URL.
def save_file_local(file):
    print("[save_file_local]: Saving photo")
    upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
    os.makedirs(upload_folder, exist_ok=True)  # Create the folder if it doesn't exist
    filename = secure_filename(file.filename)  # Sanitize the filename
    file_path = os.path.join(upload_folder, filename)
    file.save(file_path)  # Save the file to the local filesystem
    print("[save_file_local]: filename: ", filename)
    return f"/uploads/{filename}"  # Return the relative path for the client

# Save the file to AWS S3 and return the URL.
def save_file_s3(file):

    try:
        # Get the S3 client (automatically uses IAM role if running in AWS)
        s3_client = boto3.client('s3', region_name=os.getenv("AWS_REGION", "us-east-2"))

        # Get the bucket name
        bucket_name = os.getenv("S3_BUCKET_NAME", "reach-event-images")
        print(f"Using S3 Bucket: {bucket_name}") # Debugging

        filename = secure_filename(file.filename)

        # Debugging
        print(f"Uploading {filename} to S3 bucket {bucket_name}...")

        # Upload the file to S3
        s3_client.upload_fileobj(
            file,
            bucket_name,
            filename,
            ExtraArgs={"ContentType": file.content_type}  # Ensure correct file type
        )

        # Return the public URL
        file_url = f"https://{bucket_name}.s3.amazonaws.com/{filename}"
        print(f"Upload successful! File URL: {file_url}")

        # Return the URL of the uploaded image
        return file_url

    except NoCredentialsError:
        print("AWS credentials are missing!")
        raise RuntimeError("AWS credentials are not configured correctly.")
    except ClientError as e:
        print(f"S3 upload failed: {e}")
        raise RuntimeError(f"Failed to upload file to S3: {e}")
    
# Save the file based on the environment (development or production).
def save_file(file):
    environment = current_app.config.get('ENV', 'development')  # Default to 'development'
    if environment == 'production':
        return save_file_s3(file)  # Save to S3 in production
    return save_file_local(file)  # Save locally in development



def delete_file(file_url):
    environment = current_app.config.get('ENV', 'development')

    if environment == 'production':
        # Delete from S3
        filename = file_url.split("/")[-1]
        bucket_name = os.getenv("S3_BUCKET_NAME", "reach-event-images")
        try:
            s3_client = boto3.client('s3', region_name=os.getenv("AWS_REGION", "us-east-2"))
            s3_client.delete_object(Bucket=bucket_name, Key=filename)
            print(f"Deleted {filename} from S3.")
        except Exception as e:
            print(f"Failed to delete from S3: {e}")
    else:
        # Delete from local storage
        path = os.path.join(current_app.config.get('UPLOAD_FOLDER', 'uploads'), file_url.split('/')[-1])
        if os.path.exists(path):
            os.remove(path)
            print(f"Deleted local file: {path}")