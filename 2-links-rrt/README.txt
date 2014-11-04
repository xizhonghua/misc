VERSION: ompl-0.14.1
Compiled on:
    OSX         4/5/2014 with boost 1.55
    Linux64     4/5/2014 with boost 1.49
    
Makefile:

#--------------------------------------------------------------------
# OMPL
#--------------------------------------------------------------------
OMPL_DIR  = ./lib/ompl
OMPL_INCL = -I${OMPL_DIR}
ifeq ($(PLATFORM),MAC_OS_X)
    OMPL_LIB = -L${OMPL_DIR}/osx -lompl -L/opt/local/lib/ -lboost_system-mt
else 
    OMPL_LIB = -L${OMPL_DIR}/linux64 -lompl
endif