import boto3
s3 = boto3.client('s3')

BUCKET_NAME = 'roomreserve-media'
PREFIX = 'media/'
CACHE_CONTROL_VALUE = 'max-age=31536000, public'

def update_cache_control():
    paginator = s3.get_paginator('list_objects_v2')
    page_iterator = paginator.paginate(Bucket=BUCKET_NAME, Prefix=PREFIX)

    for page in page_iterator:
        for obj in page.get('Contents', []):
            key = obj['Key']
            print(f"Updating: {key}")
            head = s3.head_object(Bucket=BUCKET_NAME, Key=key)
            s3.copy_object(
                Bucket=BUCKET_NAME,
                Key=key,
                CopySource={'Bucket': BUCKET_NAME, 'Key': key},
                Metadata=head['Metadata'],
                ContentType=head['ContentType'],
                CacheControl=CACHE_CONTROL_VALUE,
                MetadataDirective='REPLACE'
            )

if __name__ == "__main__":
    update_cache_control()
