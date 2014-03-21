/*
 * main.h
 *
 *  Created on: Nov 27, 2012
 *      Author: zhonghua
 */

#ifndef MAIN_H_
#define MAIN_H_

#include <sstream>
using namespace std;
#include "Env.h"

#include <ompl/geometric/planners/rrt/RRT.h>
#include <ompl/geometric/planners/kpiece/KPIECE1.h>
#include <ompl/geometric/planners/est/EST.h>
#include <ompl/geometric/planners/prm/PRM.h>
#include <ompl/geometric/planners/stride/STRIDE.h>
#include <ompl/tools/benchmark/Benchmark.h>
#include <ompl/base/samplers/GaussianValidStateSampler.h>

#include <boost/math/constants/constants.hpp>
#include <boost/format.hpp>
#include <fstream>
#include <libgen.h>

#include "RRT.h"
#include "draw.h"
#include "Timer.h"


string filename;
int samples = 20;
int mc = 0;

Planner * planner=NULL;
vector<vector<double> > path_found;


#endif /* MAIN_H_ */
