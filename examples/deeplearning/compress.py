import json
import numpy as np

data = json.load(open("data/connectivity.json",'r'))

regs = []
for r in data:
    regs.append(r['region'])
    for c in r['connections']:
        regs.append(c['region'])

regs = list(set(regs))

matr = np.zeros((len(regs),len(regs)), dtype=float)

for r in data:
    i = regs.index(r['region'])
    for c in r['connections']:
        if abs(c['value'][0]) > 0.59:
            j = regs.index(c['region'])
            matr[i][j] = c['value'][0]
            matr[j][i] = c['value'][0]

json.dump({
    'regions': regs,
    'matrix': matr.tolist(),
}, open('data/test.json', 'w'))