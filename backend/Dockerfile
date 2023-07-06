FROM bitpoke/wordpress-runtime:bedrock-php-8.0

# Set generate scripts
COPY bin/generate-products.sh /usr/local/bin/generate-products

# Set php.ini
COPY bin/php.ini /usr/local/etc/php/php.ini

# Set stall script.
COPY bin/wait-for-it.sh /usr/local/bin/wait-for-it