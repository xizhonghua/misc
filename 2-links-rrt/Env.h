/*
 * Env.h
 *
 *  Created on: Mar 20, 2014
 *      Author: zhonghua
 */

#ifndef ENV_H_
#define ENV_H_

#include "polygon.h"

#include <ompl/base/spaces/SO2StateSpace.h>
#include <ompl/base/spaces/RealVectorStateSpace.h>
#include <ompl/base/StateValidityChecker.h>
#include <ompl/base/SpaceInformation.h>


class TwoLinkRobot {
public:
	TwoLinkRobot() {
		this->L1 = this->L2 = 10;
		this->Theta1 = this->Theta2 = 0;
	}

	void Init(double l1, double l2, const vector<double>& state);

	TwoLinkRobot(const TwoLinkRobot& r);

	virtual ~TwoLinkRobot();

	TwoLinkRobot& SetState(const vector<double>& state);

	double Distance(const TwoLinkRobot& r);


	double L1;
	double L2;
	double Theta1;
	double Theta2;
	Vector2d P[3];
	vector<double> State;
};

class Env {
public:
	Env();
	virtual ~Env();
	void Init(const vector<double>& start, const vector<double> goal) { this->m_start = start; this->m_goal = goal;}
	void AddObstacle(const c_ply& ply);
	void SetRobot(const TwoLinkRobot& robot);
	bool IsValid(const vector<double>& state);
	static Env* Instance();
	bool HasIntersection(const TwoLinkRobot& r, c_ply& obstacle);
	const vector<c_ply>& GetObstacles() const { return this->m_obstacles; }
	vector<c_ply>& GetObstacles() { return this->m_obstacles; }
	TwoLinkRobot& GetRobot() { return this->m_robot; }
	void SetBounds(const vector<double> bounds) { m_bounds = bounds; }
	const vector<double> GetBounds() const { return this->m_bounds; }
	const vector<double> GetStart() const { return this->m_start; }
	const vector<double> GetGoal() const { return this->m_goal; }
protected:
	vector<c_ply> m_obstacles;
	TwoLinkRobot m_robot;
	vector<double> m_bounds;
	vector<double> m_start;
	vector<double> m_goal;
};

// simply use a random projection
class TwoLinkProjector : public ompl::base::ProjectionEvaluator
{
public:
    TwoLinkProjector(const ompl::base::StateSpace *space)
        : ompl::base::ProjectionEvaluator(space)
    {
        int dimension = std::max(2, (int)ceil(log((double) space->getDimension())));
        projectionMatrix_.computeRandom(space->getDimension(), dimension);
    }
    virtual unsigned int getDimension(void) const
    {
        return projectionMatrix_.mat.size1();
    }
    void project(const ompl::base::State *state, ompl::base::EuclideanProjection &projection) const
    {
        std::vector<double> v(space_->getDimension());
        space_->copyToReals(v, state);
        projectionMatrix_.project(&v[0], projection);
    }
protected:
    ompl::base::ProjectionMatrix projectionMatrix_;
};


class TwoLinkSpace : public ompl::base::CompoundStateSpace
{
public:
    TwoLinkSpace()
        : ompl::base::CompoundStateSpace()
    {
    	auto rvs = new ompl::base::RealVectorStateSpace();

    	auto bounds = Env::Instance()->GetBounds();

    	rvs->addDimension("x", bounds[0], bounds[2]);
    	rvs->addDimension("y", bounds[1], bounds[3]);

    	addSubspace(ompl::base::StateSpacePtr(rvs), 1.);

        for (unsigned int i = 0; i < 2; ++i)
            addSubspace(ompl::base::StateSpacePtr(new ompl::base::SO2StateSpace()), 1.);

        lock();
    }

    void registerProjections()
    {
        registerDefaultProjection(ompl::base::ProjectionEvaluatorPtr(
            new TwoLinkProjector(this)));
    }

    double distance(const ompl::base::State *state1, const ompl::base::State *state2) const
    {
        auto s1 = this->ExtractState(state1);
        auto s2 = this->ExtractState(state2);

        auto r1 = Env::Instance()->GetRobot().SetState(s1);
		auto r2 = Env::Instance()->GetRobot().SetState(s2);

        return r1.Distance(r2);
    }

    static vector<double> ExtractState(const ompl::base::State *state)
    {
    	const StateType *cstate = static_cast<const StateType*>(state);

		vector<double> s;

    	auto values = cstate->components[0]->as<ompl::base::RealVectorStateSpace::StateType>()->values;

		s.push_back(values[0]);
		s.push_back(values[1]);


		for (unsigned int i = 1; i <= 2; ++i)
		{
			s.push_back(cstate->components[i]->as<ompl::base::SO2StateSpace::StateType>()->value);
		}

		return s;
    }
};


class TwoLinkValidityChecker : public ompl::base::StateValidityChecker
{
public:
    TwoLinkValidityChecker(const ompl::base::SpaceInformationPtr &si)
        : ompl::base::StateValidityChecker(si)
    {
    }

    bool isValid(const ompl::base::State *state) const
    {
        auto st = TwoLinkSpace::ExtractState(state);

        return Env::Instance()->IsValid(st);
    }
};


#endif /* ENV_H_ */
