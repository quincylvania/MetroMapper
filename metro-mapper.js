/*
MetroMapper
metro-mapper.js

Quincy Morgan
Judith Smith
Geography 461W
Final Project
December 2016
*/
var cityInfo = {
	NY:{
		name:"New York-Newark-Jersey City",
		center:[40.80, -73.7],
		zoom:8
	},
	LA:{
		name:"Los Angeles-Long Beach-Anaheim",
		center:[33.75, -118.2],
		zoom:8
	},
	Chi:{
		name:"Chicago-Naperville-Elgin",
		center:[41.6, -87.9],
		zoom:8
	},
	DFW:{
		name:"Dallas-Fort Worth-Arlington",
		center:[32.777438, -96.994640],
		zoom:8
	},
	Hous:{
		name:"Houston-The Woodlands-Sugar Land",
		center:[29.761024, -95.366152],
		zoom:8
	},
	DC:{
		name:"Washington-Arlington-Alexandria",
		center:[38.8, -77.4],
		zoom:8
	},
	PHL:{
		name:"Philadelphia-Camden-Wilmington",
		center:[39.8, -75.25],
		zoom:8
	},
	Miami:{
		name:"Miami-Fort Lauderdale-West Palm Beach",
		center:[25.941873, -80.422065],
		zoom:8
	},
	ATL:{
		name:"Atlanta-Sandy Springs-Roswell",
		center:[33.765351, -84.4],
		zoom:8
	},
	Bos:{
		name:"Boston-Cambridge-Newton",
		center:[42.15, -71],
		zoom:8
	}
};
var years = ["2010","2000","1990","1980","1970"];
var attributesNotAppendedWithYear=["Shape_Area"];
var alternateAttributeNamesForYears={
	Shape_Area:{
		2010:"Shape_area"
	}
}
var attributeScaleFactors={
	Shape_Area:0.000001
}
var attributeUnitLabels={
	Shape_Area:"km&sup2;"
}
var attributeInfo = {
	/*
	NHGISCODE:"NHGIS Integrated Geographic Unit Code",
	GJOIN2010:"GIS Join Match Code, 2010",
	YEAR:"Data File Year",
	STATE:"NHGIS Integrated State Name",
	STATEFP:"FIPS State Code",
	STATENH:"NHGIS Integrated State Code",
	COUNTY:"NHGIS Integrated County Name",
	COUNTYFP:"FIPS County Code",
	COUNTYNH:"NHGIS Integrated County Code",
	TRACTA:"NHGIS Integrated Census Tract Code",
	NAME:"Area Name, 2010 ",
	*/
	Shape_Area:"Area",
	AV0AA:"Total Persons",
	B18AA:"White",
	B18AB:"Black or African American",
	B18AC:"American Indian, Alaska Native",
	B18AD:"Asian, Pacific Islander, Other",
	B18AE:"Two or More Races",
	A35AA:"Hispanic or Latino",
	B57AA:"Under 5 years",
	B57AB:"5 to 9 years",
	B57AC:"10 to 14 years",
	B57AD:"15 to 17 years",
	B57AE:"18 and 19 years",
	B57AF:"20 years",
	B57AG:"21 years",
	B57AH:"22 to 24 years",
	B57AI:"25 to 29 years",
	B57AJ:"30 to 34 years",
	B57AK:"35 to 44 years",
	B57AL:"45 to 54 years",
	B57AM:"55 to 59 years",
	B57AN:"60 and 61 years",
	B57AO:"62 to 64 years",
	B57AP:"65 to 74 years",
	B57AQ:"75 to 84 years",
	B57AR:"85 years and over",
	B58AA:"Male under 5 years",
	B58AB:"Male 5 to 9 years",
	B58AC:"Male 10 to 14 years",
	B58AD:"Male 15 to 17 years",
	B58AE:"Male 18 and 19 years",
	B58AF:"Male 20 years",
	B58AG:"Male 21 years	",
	B58AH:"Male 22 to 24 years",
	B58AI:"Male 25 to 29 years",
	B58AJ:"Male 30 to 34 years",
	B58AK:"Male 35 to 44 years",
	B58AL:"Male 45 to 54 years",
	B58AM:"Male 55 to 59 years",
	B58AN:"Male 60 and 61 years",
	B58AO:"Male 62 to 64 years",
	B58AP:"Male 65 to 74 years",
	B58AQ:"Male 75 to 84 years",
	B58AR:"Male 85 years and over",
	B58AS:"Female under 5 years",
	B58AT:"Female 5 to 9 years",
	B58AU:"Female 10 to 14 years",
	B58AV:"Female 15 to 17 years",
	B58AW:"Female 18 and 19 years",
	B58AX:"Female 20 years",
	B58AY:"Female 21 years",
	B58AZ:"Female 22 to 24 years",
	B58BA:"Female 25 to 29 years",
	B58BB:"Female 30 to 34 years",
	B58BC:"Female 35 to 44 years",
	B58BD:"Female 45 to 54 years",
	B58BE:"Female 55 to 59 years",
	B58BF:"Female 60 and 61 years",
	B58BG:"Female 62 to 64 years",
	B58BH:"Female 65 to 74 years",
	B58BI:"Female 75 to 84 years",
	B58BJ:"Female 85 years and over",
	AR5AA:"Total Households"
};

var cachedData = {};
var mapObjects = {};
var mapLayers = {};
var selectedLayers = [];
var hoverColor = "#00FBFF";
var selectedColor = "#0013FF";
var framesAreLinked = true;
var linkedMoving = false;
var classingMethod = "quantile";
var defaultMapInfo = {
	A:{
		city:"Bos",
		year:"2010",
		attribute:"B18AB",
		normalization:"AV0AA"
	},
	B:{
		city:"LINKED",
		year:"LINKED",
		attribute:"B18AA",
		normalization:"LINKED"
	}
};

function variableId(baseVar,year){
	var value = undefined;
	if(attributeInfo[baseVar] != undefined){
		value = baseVar;
		var altAttributeInfo = alternateAttributeNamesForYears[value];
		if(altAttributeInfo != undefined){
			var altYearName = altAttributeInfo[year];
			if(altYearName != undefined){
				value = altYearName;
			}
		}
		else if($.inArray(value,attributesNotAppendedWithYear) == -1){
			value += year;
		}
	}
	return value;
}

function floatFromUnknown(value){
	if(value == undefined){
		return value;
	}
	if(typeof(value) == "numeric"){
		return value;
	}
	var parsedFloat = parseFloat(value);
	if(!isNaN(parsedFloat)){
		return parsedFloat;
	}
	return undefined;
}

function normalizedValue(data,attribute,normalization){
	var value = floatFromUnknown(data[attribute]);
	var denom = 1;
	if(normalization != undefined){
		denom = floatFromUnknown(data[normalization]);
		if(denom == 0){
			denom = undefined;
		}
	}
	if(value != undefined && denom != undefined){
		value = value/denom;
	}
	return value;
}

function getClassBreaks(method,classCount,features,attribute,normalization){
	var classMaxes = [];
	if(method == "equidistant"){
		var max = -1000000000000000.0;
		var min = 1000000000000000.0;
		for(i in features){
			var value = normalizedValue(features[i].properties,attribute,normalization);
			if(value != undefined){
				if(value > max){
					max = value;
				}
				if(value < min){
					min = value;
				}
			}
		}
		var range = max-min;
		var stepMagnitude = range/classCount;
	
		for(i=1;i<classCount+1;i+=1){
			var classMax = min + stepMagnitude*i;
			classMaxes.push(classMax);
		}
	}
	else if(method == "quantile"){
		var allAttributeValues = [];
		var max = -1000000000000000.0;
		for(i in features){
			var value = normalizedValue(features[i].properties,attribute,normalization);
			if(value != undefined){
				allAttributeValues.push(value);
				if(value > max){
					max = value;
				}
			}
		}
		allAttributeValues.sort();
		//console.log("length "+allAttributeValues.length)
		var bucketSize = Math.floor(allAttributeValues.length/classCount);
		for(i=1;i<classCount+1;i+=1){
			var index = i*bucketSize;
			//console.log(index);
			var classMax = allAttributeValues[index];
			classMaxes.push(classMax);
		}
		classMaxes[classCount-1] = max
	}
	return classMaxes;
}

function addDataToMap(data,map,mapId,year){

	var attribute = variableId(getSelectValue(mapId,"attribute"),year);
	var normalization = variableId(getSelectValue(mapId,"normalization"),year);
	
	var classBreaks = getClassBreaks(classingMethod,5,data.features,attribute,normalization);
	//console.log(classBreaks);
	var colors = ['#ffffd4',"#fed98e","#fe9929","#d95f0e","#993404"];
	var choroplethLayer = L.geoJSON(data, {
		style: {
			fillColor:'#777',
			stroke:false,
			fillOpacity: 0.8,
			opacity:1, // line opacity
			weight:2 // line width
		},
		isCensusLayer:true,
		smoothFactor:0.75, // affects drawing speed vs sliver polygons
		onEachFeature: function(feature, layer) {
			var value = normalizedValue(feature.properties,attribute,normalization);
			if(value != undefined){
				var classFound = false;
				for(i in classBreaks){
					if(value <= classBreaks[i]){
						var color = colors[i];
						layer.setStyle({fillColor:color});
						classFound = true;
						break;
					}
				}
				if(!classFound){
					console.log("No class found for "+value);
				}
			}
			/*layer.on('mouseover', function(e) {
				e.target.bringToFront();
				if($.inArray(e.target,selectedLayers) == -1){
					e.target.setStyle({stroke:true,color:hoverColor});
				}
			});
			layer.on('mouseout', function(e) {
				if($.inArray(e.target,selectedLayers) == -1){
					e.target.setStyle({stroke:false});
				}
				for(index in selectedLayers){
					selectedLayers[index].bringToFront();
				}
			});
			layer.on('click', function(e) {
				var selectedIndex = $.inArray(e.target,selectedLayers);
				if(selectedIndex == -1){
					e.target.setStyle({stroke:true,color:selectedColor});
					selectedLayers.push(e.target);
				}
				else{
					selectedLayers.splice(selectedIndex, 1);
					e.target.bringToFront();
					e.target.setStyle({stroke:true,color:hoverColor});
				}
			});*/
			
		}
	});
	mapLayers[mapId] = choroplethLayer;
	choroplethLayer.addTo(map);
	setLayerOpacity(mapId);
}

function initiateMapSection(mapId){
	var mapSectionParent = $( "#map-section-source" ).clone();
	mapSectionParent.html(mapSectionParent.html().replace(/MAPID/g, mapId));

	var mapSection = mapSectionParent.children().first();
	var metroSelect = mapSection.find("select[variable='city']");
	metroSelect.html("");
	for(city in cityInfo){
		metroSelect.append($.parseHTML("<option value='"+city+"'>"+cityInfo[city].name+"</option>"));
	}
	
	var yearSelect = mapSection.find("select[variable='year']");
	yearSelect.html("");
	for(i in years){
		var year = years[i];
		yearSelect.append($.parseHTML("<option value='"+year+"'>"+year+"</option>"));
	}
	
	var attrSelect = mapSection.find("select[variable='attribute']");
	var normSelect = mapSection.find("select[variable='normalization']");
	attrSelect.html("");
	normSelect.html("");
	for(attr in attributeInfo){
		var name = attributeInfo[attr];
		attrSelect.append($.parseHTML("<option value='"+attr+"'>"+name+"</option>"));
		normSelect.append($.parseHTML("<option value='"+attr+"'>"+name+"</option>"));
	}
	normSelect.prepend($.parseHTML("<option value='NONE'>None</option>"));
	
	for(otherMapId in defaultMapInfo){
		if(otherMapId != mapId){
			yearSelect.prepend($.parseHTML("<option value='LINKED' tomap='"+otherMapId+"'>Year "+otherMapId+"</option>"));
			metroSelect.prepend($.parseHTML("<option value='LINKED' tomap='"+otherMapId+"'>Metro "+otherMapId+"</option>"));
			attrSelect.prepend($.parseHTML("<option value='LINKED' tomap='"+otherMapId+"'>Variable "+otherMapId+"</option>"));
			normSelect.prepend($.parseHTML("<option value='LINKED' tomap='"+otherMapId+"'>Normalization "+otherMapId+"</option>"));
		}
	}
	var mapInfo = defaultMapInfo[mapId];
	metroSelect.val(mapInfo.city);
	yearSelect.val(mapInfo.year);
	attrSelect.val(mapInfo.attribute);
	normSelect.val(mapInfo.normalization);
	
	mapSection.appendTo( "#maps-container" );

	var map = L.map(mapId,{
		doubleClickZoom:true,
		fadeAnimation:false,
		zoomAnimation:true,
		minZoom:6,
		mapId:mapId,
		year:"",
		city:""
	});
	map.on("moveend",function(e){
		if(framesAreLinked){
			if(linkedMoving){
				linkedMoving = false;
			}
			else{
				linkedMoving = true;
				var targetMap = e.target;
				var targetMapId = targetMap.options.mapId;
				var mapCenter = e.target.getCenter();
				if(mapCenter != undefined){
					for(mapId in mapObjects){
						if(mapId != targetMapId){
							var map = mapObjects[mapId];
							if(map.options.city == targetMap.options.city){
								mapObjects[mapId].setView(mapCenter,e.target._zoom,{animate:false,duration:0});
							}
						}
					}
				}
			}
		}
	});
	addBasemapLayer(map);
	L.control.scale().addTo(map);
	mapObjects[mapId] = map;

}
function addBasemapLayer(map){
	removeBasemapLayer(map);
	var tileLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
		detectRetina:false
	});
	tileLayer.addTo(map);
}
function removeBasemapLayer(map){
	var layers = map._layers;
	for(i in layers){
		var layer = layers[i];
		if(layer._tiles != undefined){
			console.log(map);
			layer.removeFrom(map);
		}
	}
}

function getSelectValue(mapId,variable){
	var section = $(".map-section[mapid='"+mapId+"']");
	var value = section.find("select[variable='"+variable+"']").val();
	if(value == "LINKED"){
		var toMapId = section.find("select[variable='"+variable+"'] option:selected").attr("tomap");
		if(toMapId != mapId){
			var toMapSection = $(".map-section[mapid='"+toMapId+"']");
			value = toMapSection.find("select[variable='"+variable+"']").val();
			toMapSection.find("select[variable='"+variable+"'] option[value='LINKED']").attr("disabled","");
		}
	}
	else{
		$(".map-section:not([mapid='"+mapId+"']) select[variable='"+variable+"'] option[value='LINKED']").removeAttr("disabled");
	}
	return value;
}
function loadMap(mapId){
	var map = mapObjects[mapId];
	var priorCity =  map.options.city;
	var section = $(".map-section[mapid='"+mapId+"']");
	
	var city = getSelectValue(mapId,"city");
	var year = getSelectValue(mapId,"year");
	L.setOptions(map,{year:year,city:city});
	
	var oldLayer = mapLayers[mapId];
	if (typeof oldLayer !== 'undefined') {
		map.removeLayer(oldLayer);
	}
	
	var dataId = city+year;
	var data = cachedData[dataId];
	if (typeof data !== 'undefined'){
		addDataToMap(data,map,mapId,year);
		loadTable();
	}
	else{
		$.getJSON("data/"+dataId+".geojson", function(data) {
			cachedData[dataId] = data;
			addDataToMap(data,map,mapId,year);
			loadTable();
		});
	}	

	if(city !== priorCity){
		map.setView(cityInfo[city].center, cityInfo[city].zoom);
	}
}

function loadTable(){
	
	var attributeBodyTable = $("#table-body-cols table#body-cells");
	attributeBodyTable.html("<tr class='hrow'></tr>");
	var headerRow = attributeBodyTable.find("tr.hrow");
	for(baseVar in attributeInfo){
		var varName = attributeInfo[baseVar];
		headerRow.append( $.parseHTML("<th basevar='"+baseVar+"'>"+varName+"</th>"));
	}
	var headerCells = headerRow.find("th");
	
	var hColTable = $("table.map-attributes#hcol");
	hColTable.html("<tr class='hrow'><th>-</th></tr>");
	var addedDataIds = [];
	var integerFormat = '#,##0';
	var floatFormat = '#,###.#0';
	for(mapId in mapObjects){
		var map = mapObjects[mapId];
		var year = map.options.year;
		var dataId = map.options.city+year;
		var data = cachedData[dataId];
		if($.inArray(dataId,addedDataIds) == -1 && data !== undefined){
			addedDataIds.push(dataId);
			hColTable.append($.parseHTML("<tr><td>"+cityInfo[map.options.city].name+" "+map.options.year+"</td></tr>"));
			attributeBodyTable.append($.parseHTML("<tr dataId='"+dataId+"'></tr>"));
			var tableRow = attributeBodyTable.find("tr[dataId='"+dataId+"']");
			
			var features = data.features;

			headerCells.each(function(){
				var baseAttr = $(this).attr("basevar");
				var attribute = variableId(baseAttr,year);
				var value = 0;
				for(i in features){
					var feature = features[i];
					var rawValue = feature.properties[attribute];
					if(rawValue !== undefined){
						var floatValue = rawValue
						if(typeof(rawValue !== "numeric")){
							floatValue = parseFloat(rawValue);
						}
						if(!isNaN(floatValue)){
							value += floatValue;
						}
					}
				}
				var scaleFactor = attributeScaleFactors[baseAttr];
				if(scaleFactor != undefined){
					value = value*scaleFactor;
				}
				var formattedValue = $.format.number(value,integerFormat);
				var unitLabel = attributeUnitLabels[baseAttr];
				if(unitLabel != undefined){
					formattedValue += " "+unitLabel;
				}

				tableRow.append( $.parseHTML("<td basevar='"+baseAttr+"' value='"+value+"'>"+formattedValue+"</td>"));
			});
		}
	}
	if(addedDataIds.length == 2){
		hColTable.append($.parseHTML("<tr class='total-dif'><td class='computed'>Total Difference</td></tr>"));
		attributeBodyTable.append($.parseHTML("<tr class='difference total-dif'></tr>"));
		var totalDifRow = attributeBodyTable.find("tr.total-dif");
		
		hColTable.append($.parseHTML("<tr><td class='computed'>Percent Difference</td></tr>"));
		attributeBodyTable.append($.parseHTML("<tr class='difference percent-dif'></tr>"));
		var percentDifRow = attributeBodyTable.find("tr.percent-dif");
		
		headerCells.each(function(){
			var baseVar = $(this).attr("basevar");
			var value1 = attributeBodyTable.find("tr[dataid='"+addedDataIds[0]+"'] td[basevar='"+baseVar+"']").attr("value");
			var value2 = attributeBodyTable.find("tr[dataid='"+addedDataIds[1]+"'] td[basevar='"+baseVar+"']").attr("value");
			var difference = value2 - value1;
			var difClass = "zero";
			if(difference < 0){
				difClass = "negative";
			}
			else if(difference > 0){
				difClass = "positive";
			}
			var percentDif = (difference/value1) * 100;
			var formattedPercent = "&mdash;";
			var percentDifClass = "zero";
			
			if(!isNaN(percentDif) && value1!=0){
				percentDifClass = difClass;
				formattedPercent = $.format.number(percentDif, floatFormat)+"%";
			}
			if(percentDifClass == "positive"){
				formattedPercent = "+"+formattedPercent;
			}
			var formattedTotal = $.format.number(difference, integerFormat);
			var unitLabel = attributeUnitLabels[baseVar];
			if(unitLabel != undefined){
				formattedTotal += " "+unitLabel;
			}
			totalDifRow.append($.parseHTML("<td class='"+difClass+"' basevar='"+baseVar+"'>"+formattedTotal+"</td>"));
			percentDifRow.append($.parseHTML("<td class='"+percentDifClass+"' basevar='"+baseVar+"'>"+formattedPercent+"</td>"));
		});
	}
	hColTable.append($.parseHTML("<tr><td></td></tr>"));
	attributeBodyTable.append($.parseHTML("<tr class='margin'></tr>"));
	var marginRow = attributeBodyTable.find("tr.margin");
	headerCells.each(function(){
		marginRow.append($.parseHTML("<td></td>"));
	});
	
}

$(document).on( "change", ".map-settings select",function() {
	for(mapId in mapObjects){
		loadMap(mapId);
	}
});
$(document).on( "change", "#options input#basemap-toggle",function() {
	var checked = $(this).is(":checked");
	for(mapId in mapObjects){
		var map = mapObjects[mapId];
		if(checked){
			addBasemapLayer(map);
		}
		else{
			removeBasemapLayer(map);
		}
	}
});
function setLayerOpacity(mapId){
	var value = $("#options input#opacity-slider").val()/100;
	var map = mapObjects[mapId];
	var layers =  map._layers;
	for(i in layers){
		var layer = layers[i];
		if(layer != undefined && layer._layers != undefined && layer.options.isCensusLayer != undefined){
			layer.setStyle({fillOpacity:value});
		}
	}
}
$(document).on( "change", "#options input#opacity-slider",function() {
	for(mapId in mapObjects){
		setLayerOpacity(mapId);
	}
});
$(document).on( "click", "a.close-veil",function(event) {
	$("#veil .overlay-box").hide();
	$("#veil").hide();
	return false;
});
$(document).on( "click", "a#open-instructions",function() {
	$("#veil .overlay-box#instructions").show();
	$("#veil").show();
	return false;
});
$(document).on( "click", "a#open-about",function() {
	$("#veil .overlay-box#about").show();
	$("#veil").show();
	return false;
});


$(document).on( "change", "#options input#linked-frames-toggle",function() {
	framesAreLinked = $(this).is(":checked");
	if(framesAreLinked){
		for(mapId in mapObjects){
			var map = mapObjects[mapId];
			map.fire("moveend");
		}
	}
});

$(document).on( "change", "#options input[type='radio'][name='classing-method']",function() {
	classingMethod = $(this).val();
	for(mapId in mapObjects){
		loadMap(mapId);
	}
});
$(document).ready(function(){
	for(mapId in defaultMapInfo){
		initiateMapSection(mapId);
		loadMap(mapId);
	}
});