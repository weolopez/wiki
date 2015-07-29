for f in `find src -name '*.js'`
do
   if [[ $f == *"vendor"* ]]
   then 
	echo "Skipping $f"
   else 
	echo "Processing $f"
   	plato -d report/r-$f -t "report for file $f" $f
   fi
done

