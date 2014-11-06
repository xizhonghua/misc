#!/usr/bin/env python
import time
import numpy as np
import cv2
import sys

factor = 10
frameIndex = 0
method = 'simple'

def readFrame(cap):
    ret, frame = cap.read()
    frame = cv2.resize(frame, (0,0), fx=0.33, fy=0.33)
    return frame

def simpleLapse(cap, factor):
    global frameIndex
    for i in range(0, factor):
        frame = readFrame(cap)
        frameIndex += 1
    return frame

def averageLapse(cap, factor):
    global frameIndex

    initFrame = readFrame(cap)
    frameIndex += 1

    for i in range(0, factor-1):
        frame = readFrame(cap)
        initFrame = initFrame*0.3 + 0.7*frame        
        frameIndex += 1

    initFrame = initFrame.astype(np.uint8)

    return initFrame

if len(sys.argv) < 2:
    print sys.argv[0], 'filename [method]'
    print 'supported methods: simple, average'
    sys.exit(1)

cap = cv2.VideoCapture(sys.argv[1])

if len(sys.argv) >= 3:
    method = sys.argv[2];


lastClock = time.clock()

while(cap.isOpened()):
    methodFun = None
    if method == 'simple': methodFun = simpleLapse
    if method == 'average': methodFun = averageLapse

    frame = methodFun(cap, factor)
    cv2.imshow( method +  ' lapse', frame)
    nowClock = time.clock()
    processTime = (nowClock - lastClock)*1000
    lastClock = nowClock

    # waitTime = 1 if processTime > 50 else 20

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

    print frameIndex, ' frames processed! processed time', processTime, 'ms'

cap.release()
cv2.destroyAllWindows()