#!/bin/bash
rm *_log.txt
echo 300 > time_limit.txt
for i in `seq 1 31`;
do
	make eg1-rrt >> eg1_rrt_log.txt		&
	make eg1-prm >> eg1_prm_log.txt		&
	make eg1-gauss >> eg1_gauss_log.txt	&
	
	wait

	make eg2-rrt >> eg2_rrt_log.txt		&
	make eg2-prm >> eg2_prm_log.txt		&
	make eg2-gauss >> eg2_gauss_log.txt	&

	wait
	
	make eg5-rrt >> eg5_rrt_log.txt		&
	make eg5-prm >> eg5_prm_log.txt		&
	make eg5-gauss >> eg5_gauss_log.txt	&

	wait

	make eg10-rrt >> eg10_rrt_log.txt	&
	make eg10-prm >> eg10_prm_log.txt	&
	make eg10-gauss >> eg10_gauss_log.txt	&

	wait

	make eg300-rrt >> eg300_rrt_log.txt	&
	make eg300-prm >> eg300_prm_log.txt	&
	make eg300-gauss >> eg300_gauss_log.txt	&
	
	wait
done  
