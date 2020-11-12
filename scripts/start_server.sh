#!/bin/bash
cd /home/ubuntu/webapp/

sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -c file:/home/ubuntu/webapp/cloudwatch-config.json \
    -s
    
sudo kill -9 $(sudo lsof -t -i:4000);
sudo nohup npm start > /dev/null 2> /dev/null < /dev/null &

