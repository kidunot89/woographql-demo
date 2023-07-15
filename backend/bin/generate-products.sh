#!/bin/bash

wp plugin activate wc-smooth-generator
wp wc generate products $1 
