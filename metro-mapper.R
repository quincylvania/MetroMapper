
library(rgdal)
library(rgeos)
library(geojsonio)

paramsNY = list(name="NY",equivParams=list(
  list(state="36", county=c("047","081","061","005","085","119","087","071","103","059","079","027")),
  list(state="34", county=c("003","017","025","023","031","029","013","039","027","035","037","019")),
  list(state="42", county=c("103")) #PA
))
paramsLA = list(name="LA",equivParams=list(list(state="06", county=c("059","037"))))
paramsCHI = list(name="Chi",equivParams=list(
  list(state="17", county=c("031","037","043","063","089","093","111","197","097")),
  list(state="18", county=c("073","089","111","127")),
  list(state="55", county=c("059"))
))
paramsDFW = list(name="DFW",equivParams=list(
  list(state="48", county=c("085","113","121","139","221","231","251","257","367","397","425","439","497"))
))
paramsHous = list(name="Hous",equivParams=list(
  list(state="48",county=c("201","157","339","039","167","291","437","071","015"))
))

paramsDC = list(name="DC",equivParams=list(
  list(state="11", county=c("001")), #DC
  list(state="51", county=c("013","043","047","059","061","107","153","157","177","179","187","510","600","610","683","685","630")),#VA
  list(state="54", county=c("037")), # West VA
  list(state="24", county=c("009","017","021","031","033")) # Maryland
))
paramsPHL = list(name="PHL",equivParams=list(
  list(state="42", county=c("017","029","045","091","101")),#PA
  list(state="34", county=c("005","007","015","033")), # NJ
  list(state="24", county=c("015")), # MD
  list(state="10", county=c("003")) # DE
))
paramsMiami = list(name="Miami",equivParams=list(
  list(state="12",county=c("086","011","099","025")) # Dade County (25) renamed to Miami-Dade (86) in 1997
))
paramsAtl = list(name="ATL",equivParams=list(
  list(state="13",county=c("121","089","135","067","063","035","057","097","113","117","151","217","247","297","013","077","015","045","223","227","255"))
))
paramsBos = list(name="Bos",equivParams=list(
  list(state="25",county=c("021","023","025","017","009")),# MA
  list(state="3",county=c("015","017")) #NH
))

geoParamsVector=list(paramsNY,paramsLA,paramsCHI,paramsDFW,paramsHous,paramsDC,paramsPHL,paramsMiami,paramsAtl,paramsBos)

years = c("1970","1980","1990","2000","2010")
for(year in years){
  sourceCsv = read.csv(paste("nhgis0014_csv/nhgis0014_ts_nominal_",year,"_tract.csv",sep=""))
  nationalShp = readOGR("nhgis0013_shape/",paste("US_tract_",year,"_conflated",sep=""))
  joinedNational = merge(nationalShp ,sourceCsv,by.x="GISJOIN",by.y=paste("GJOIN",year,sep=""))
  joinedNational = spTransform(joinedNational, CRS("+proj=longlat +datum=WGS84"))
  for(geoParams in geoParamsVector){
    metroName = geoParams$name
    equivParams = geoParams$equivParams
    equiv = FALSE
    for(paramList in equivParams){
      stateFips = paramList$state
      countyFips = paramList$county
      equiv = equiv | (joinedNational$STATEFP == stateFips & is.element(joinedNational$COUNTYFP,countyFips))
    }
    matchingFeatures = joinedNational[equiv,]
    simplifiedGeom <- gSimplify(matchingFeatures,tol=0.00025, topologyPreserve=TRUE)
    simplifiedFeatures = SpatialPolygonsDataFrame(simplifiedGeom, data=matchingFeatures@data,match.ID = F)
    geojson_write(simplifiedFeatures, file=paste("data/",metroName,year,".geojson",sep=""))
  }
}

