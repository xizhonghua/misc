#!/bin/bash

printf "env\trrt-s\trrt-sr\trrt-t\trrt-std\tprm-s\tprm-sr\tprm-t\tprm-std\tgauss-s\tgauss-sr\tgauss-t\tgauss-std\n"
for eg in eg1 eg2 eg5 eg10 eg300 
do
	printf $eg
	for method in rrt prm gauss
	do
		p="$eg"_"$method"
		f="$p"_log.txt
		
		grep "PATH" $f > "$p"_found.txt
		grep "Time = " $f | cut -d ' ' -f3 > "$p"_time.txt
		grep "Created" $f | cut -d ' ' -f7 > "$p"_samples.txt
		found=`grep "PATH FOUND" $f | wc -l`
		total=`cat "$p"_found.txt | wc -l`
		if [ $total -eq 0 ]; then
			success_rate=0.0
		else
			success_rate=`echo "$found * 1.0 / $total" | bc -l`
		fi
		#echo "---"
		#printf "found=%ld, total=%ld, rate=%lf\n" $found $total $success_rate
		#echo "---"
		mean_sampled=`cat "$p"_samples.txt | st -mean`
		mean_time=`cat "$p"_time.txt | st -mean`
		std_time=`cat "$p"_time.txt | st -stddev`
		
		printf "\t%0.0lf\t%0.3lf\t%0.0lf\t%0.0lf" $mean_sampled $success_rate $mean_time  $std_time		
	done
	printf "\n"
done
