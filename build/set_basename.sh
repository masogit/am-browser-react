base_name=/AMB
html=index.html
origin=${html}_bak

properties_default=am-browser-config.properties.default
properties=am-browser-config.properties
if ! [ -f $origin ]; then
	mv $html $origin
fi

echo > $html

if [ -f $properties_default ]; then
	node=0
	while read line; do
		trim_line="$(echo -e "${line}" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
		if [ $node == 1 ] && [[ $trim_line == [* ]]; then 
			break
		fi

		if [ "$trim_line" == "[node]" ]; then
			node=1
		fi

		if ! [ "${trim_line:0:1}" == '#' ] && ! [ "${trim_line:0:1}" == "[" ]; then
			IFS='=' read -a trim_parts <<< "$trim_line"
			key="$(echo -e "${trim_parts[0]}" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"

			value="$(echo -e "${trim_parts[1]}" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
			if [ "$key" == "base" ] && [ $node == 1 ]; then
				base_name=$value
				break
		    fi	
		fi
	done < $properties_default
fi


if [ -f $properties ]; then
	node=0
	while read line; do
		trim_line="$(echo -e "${line}" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
		if [ $node == 1 ] && [[ $trim_line == [* ]]; then 
			break
		fi

		if [ "$trim_line" == "[node]" ]; then
			node=1
		fi
		if ! [ "${trim_line:0:1}" == "#" ] && ! [ "${trim_line:0:1}" == "[" ]; then
			IFS='=' read -a trim_parts <<< "$trim_line"
			key="$(echo -e "${trim_parts[0]}" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
			value="$(echo -e "${trim_parts[1]}" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
			if [ "$key" == "base" ]; then
				base_name=$value
				break
		    fi	
		fi
	done < $properties
fi

if [ -f $origin ]; then
	cat $origin | while read line
	do
		trim_line="$(echo -e "${line}" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
		IFS='=' read -a trim_parts <<< "$trim_line"
		if [ "${trim_parts[0]}" == "window.amb_basename" ]; 
		  then
			echo '####### INFO: SET BASE NAME #########'
			echo base name is set to $base_name
			echo '##########################################################'
	    	echo "window.amb_basename='${base_name}';" >> $html
	   	else
	   		echo $line >> $html
	    fi
	done
fi
