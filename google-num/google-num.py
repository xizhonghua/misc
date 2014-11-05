#!/usr/bin/env python
import os
import random

with open('result.txt', 'a') as output:
    for k in range(1,10000):
        i = random.randint(0, 1e7)
        os.system('(echo "GET /search?q=' + str(i) + '" ; sleep 1) | telnet www.google.com 443 > tmp')
        with open('tmp', 'r') as f:
            data = f.read()
        os.system('sleep 2')

        s = data.find('>About')
        t = data.find('results<', s)
        text = data[s+7:t-1];
        if len(text)<=0 or len(text)>=15: continue
        result = int(text.replace(',',''))
        output.write(str(i) + ' ' + str(result)+'\n')
        output.flush()
        