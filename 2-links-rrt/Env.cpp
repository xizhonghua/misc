/*
 * Env.cpp
 *
 *  Created on: Mar 20, 2014
 *      Author: zhonghua
 */

#include "Env.h"
#include "intersection.h"

// ============================================================
// Robot
// ============================================================

TwoLinkRobot::~TwoLinkRobot() {

}

void TwoLinkRobot::Init(double l1, double l2, const vector<double>& state)
{
	this->L1 = l1;
	this->L2 = l2;
	this->SetState(state);
}

TwoLinkRobot::TwoLinkRobot(const TwoLinkRobot& r)
{
	this->L1 = r.L1;
	this->L2 = r.L2;
	this->Theta1 = r.Theta1;
	this->Theta2 = r.Theta2;
	this->State = r.State;

	for(int i=0;i<3;i++)
		this->P[i] = r.P[i];
}

TwoLinkRobot& TwoLinkRobot::SetState(const vector<double>& state)
{
	assert(state.size() == 4);

	double x = state[0];
	double y = state[1];
	double t1 = state[2];
	double t2 = state[3];

	//TODO extract configuration from state

	this->State = state;

	this->P[0] = Vector2d(x,y);
	this->P[1] = this->P[0] + Vector2d(this->L1*cos(t1), this->L1*sin(t1));
	this->P[2] = this->P[0] + Vector2d(this->L2*cos(t2), this->L2*sin(t2));

//	printf("Robot set to x/y/t1/t2 = %0.0lf / %0.0lf / %0.3lf / %0.3lf", x, y, t1, t2);
//	cout<<" P = "<<P[0]<<" "<<P[1]<<" "<<P[2]<<endl;

	return *this;
}

double TwoLinkRobot::Distance(const TwoLinkRobot& r)
{
	double dist = 0.0;
	for(int i=0;i<3;i++)
		dist += (this->P[i] - r.P[i]).normsqr();
	return sqrt(dist);
}

// ============================================================
// Env
// ============================================================

Env* m_env = NULL;

Env::Env() {
	// TODO Auto-generated constructor stub

	this->m_bounds = {-20, -20, 520, 520};
}

void Env::Init(double env_width, double env_height, const vector<double>& start, const vector<double> goal)
{
	this->m_bounds = { -10, -10, env_width+10, env_height+10 };

	c_ply bb(c_ply::PIN);
	bb.beginPoly();
	bb.addVertex(-10, -10);
	bb.addVertex(-10, env_height + 10);
	bb.addVertex(env_width + 10, env_height + 10);
	bb.addVertex(env_width + 10, -10);
	bb.endPoly(false);

	this->AddObstacle(bb);

	this->m_start = start; this->m_goal = goal;
}

Env::~Env() {
	// TODO Auto-generated destructor stub
}

void Env::AddObstacle(const c_ply& ply)
{
	this->m_obstacles.push_back(ply);
}

void Env::SetRobot(const TwoLinkRobot& robot)
{
	this->m_robot = robot;
}

bool Env::IsValid(const vector<double>& state)
{
	this->m_robot.SetState(state);

	for(auto& o : this->m_obstacles)
	{
		if(this->HasIntersection(this->m_robot, o)) return false;
	}

	return true;
}

bool Env::HasIntersection(const TwoLinkRobot& r, c_ply& obstacle)
{
	//check points
	if(obstacle.getType() == c_ply::POUT)
	{
		if(obstacle.enclosed(r.P[0])) return true;
	}
	else
	{
		if(!obstacle.enclosed(r.P[0])) return true;
	}

	//check edges...
	for( int l=1;l<3;l++)
	{
		//robot link
		const Point2d& a=this->m_robot.P[0];
		const Point2d& b=this->m_robot.P[l];

		ply_vertex * ptr=obstacle.getHead();

		do{
			ply_vertex * next=ptr->getNext();

			//create p
			const Point2d& c=ptr->getPos();
			const Point2d& d=next->getPos();

			//
			bool r=SegSegInt(a.get(),b.get(),c.get(),d.get());
			if(r) return true; //collision found

			//next
			ptr=next;
		}
		while(ptr!=obstacle.getHead());

	}//end for
	return false;
}


Env* Env::Instance()
{
	if(m_env == NULL)
		m_env = new Env();

	return m_env;
}

