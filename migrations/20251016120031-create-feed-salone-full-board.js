'use strict';

var dbm;
var type;
var seed;
var fs = require('fs');
var path = require('path');

exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

// Embedded CSV content for nodes and connections (provided by user)
const NODES_CSV = `id,text,type,Pillar,Subpillar
N1,Training of the Water Users Associations (RAIC),Activities,Mechanization and Irrigation,Irrigation
N2,Construct large-scale irrigation systems in 6 ILM districts (FSRP),Activities,Mechanization and Irrigation,Irrigation
N3,"Construct solar-powered boreholes with irrigation schemes (AVDP, FSRP, RRVCP)",Activities,Mechanization and Irrigation,Irrigation
N4,Construct earth dams (AVDP),Activities,Mechanization and Irrigation,Irrigation
N5,"Construct irrigation infrastructure in Tormabum and Gbondapi (RRVCP, RAIC)",Activities,Mechanization and Irrigation,Irrigation
N6,Construct irrigation schemes and water control works (RAIC),Activities,Mechanization and Irrigation,Irrigation
N7,"Develop and rehabilitate Inland Valley Swamps for rice production (AVDP, FSRP, WFP, MAFS)",Activities,Mechanization and Irrigation,Irrigation
N8,"Training of youths contractors on IVS Development/Rehabilitation. (AVDP, WFP, MAFS)",Activities,Mechanization and Irrigation,Irrigation
N9,"Hire tractors to plough, harrow, seed (RRVCP, RAIC, FSRP, MAFS)",Activities,Mechanization and Irrigation,Mechanization
N10,Training of youths on tractor operator. (SLARiS),Activities,Mechanization and Irrigation,Mechanization
N11,Procure harvesters and labour-saving equipment to farmers (FSRP),Activities,Mechanization and Irrigation,Mechanization
N12,The Water Users Associations are trained in water management,Outputs,Mechanization and Irrigation,
N13,"Farmers have access to reliable and functional irrigation infrastructure (large-scale schemes, solar-powered boreholes, water control works, canals, drains)",Outputs,Mechanization and Irrigation,
N14,Farmers have access to rehabilitated Inland Valley Swamps for rice cultivation,Outputs,Mechanization and Irrigation,
N15,Youths contractors are trained on IVS Development/Rehabilitation,Outputs,Mechanization and Irrigation,
N16,Farmers have access to prepared farmland ready for cultivation.,Outputs,Mechanization and Irrigation,
N17,Youths are trained on tractor operation,Outputs,Mechanization and Irrigation,
N18,Farmers have access to harvesters and labour-saving equipment.,Outputs,Mechanization and Irrigation,
N19,"Farmers are expanding their cultivated area, including Inland Valley Swamps 
(IVS) with better irrigation system under rice and other crops.",Intermediate outcome 1,Mechanization and Irrigation,
N20,Farmers increase use of mechanization for land preparation.,Intermediate outcome 1,Mechanization and Irrigation,
N21,Farmers increase use of mechanization for harvesting,Intermediate outcome 1,Mechanization and Irrigation,
N22,Better control of water supply and drainage.,Intermediate outcome 2,Mechanization and Irrigation,
N23,Crops are less vulnerable to floods ans droughts.,Intermediate outcome 2,Mechanization and Irrigation,
N24,Farmers can plant more than once a year (double/triple cropping).,Intermediate outcome 2,Mechanization and Irrigation,
N25,Farmers prepare and plant on time,Intermediate outcome 2,Mechanization and Irrigation,
N26,Farmers spend less time and effort on heavy tasks,Intermediate outcome 2,Mechanization and Irrigation,
N27,Farmers harvest land on time.,Intermediate outcome 2,Mechanization and Irrigation,
N28,Farmers experience fewer post-harvest losses.,Intermediate outcome 2,Mechanization and Irrigation,
N29,Construct and Equip fertilizer lab (FSRP),Activities,Seed and Inputs System,Input Production
N30,"Financial and Technical support to Private Seed Entities (SLARiS, RRVCP)",Activities,Seed and Inputs System,Input Production
N31,Establishment of cocoa clonal gardens at SLARI (AVDP),Activities,Seed and Inputs System,Input Production
N32,Rehabilitation of SMP Production centre-Kobia (SLARiS),Activities,Seed and Inputs System,Input Production
N33,"Procurement of Mobile Rice Seed, Cleaning Machines, 
Mobile maize threshers, and tractors for Seed Entities (SLARiS)",Activities,Seed and Inputs System,Input Production
N34,"Financial and Technical support for the production of breeder
 and foundation seed rice & maize by SLARI (SLARiS, FSRP)",Activities,Seed and Inputs System,Input Production
N35,"Capacity building for seed entities in seed production, 
processing, and business management (SLARiS, FSRP, RRVCP)",Activities,Seed and Inputs System,Input Production
N36,"Construction of 500 Mt of stores and drying floors, 
wash facilities and hand dug well for out-grower seed producers (SLARiS)",Activities,Seed and Inputs System,Input Production
N37,Supply rice seeds to farmers through vouchers (FSRP),Activities,Seed and Inputs System,Distribution Development
N38,"Supply smallholder farmers with improved/certified seeds and input packages
 (agrochemicals, fertilizers) through agrodealers for key value chains: 
vegetables (onion, hot pepper, Irish potato, black pepper), 
rice, cocoa, oil palm, and tubers. (RAIC, AVDP, RRVCP)",Activities,Seed and Inputs System,Distribution Development
N39,"Training for agro-dealers to strengthen last-mile input delivery. (RAIC, AVDP)",Activities,Seed and Inputs System,Distribution Development
N40,Rehabilitation of SLeSCA HQ - Freetown (SLARiS),Activities,Seed and Inputs System,Input Quality Control and Certification
N41,Construction of National Seed Testing Laboratory - Mile 91 and Supply of lab equipment (SLARiS),Activities,Seed and Inputs System,Input Quality Control and Certification
N42,Provide financial support to SLeSCA. (RRVCP),Activities,Seed and Inputs System,Input Quality Control and Certification
N43,Training of SLeSCA Field and Laboratory Technicians (SLARiS),Activities,Seed and Inputs System,Input Quality Control and Certification
N44,Farmers have access to quality fertilizers and input packages,Outputs,Seed and Inputs System,
N45,"Farmers have access to improved/certified seeds for staple and cash crops 
(vegetables, rice, cocoa, oil palm, tubers)",Outputs,Seed and Inputs System,
N46,"Seed entities have access to mobile rice seed cleaners, maize threshers, 
and tractors to support seed production",Outputs,Seed and Inputs System,
N47,Seed entities have access to breeder and foundation seeds for rice and maize,Outputs,Seed and Inputs System,
N48,Seed entities are able to produce certified seeds,Outputs,Seed and Inputs System,
N49,"Out-grower seed producers have access to proper infrastructure for seed drying, 
cleaning, and storage.",Outputs,Seed and Inputs System,
N50,Last-mile farmers have access to input.,Outputs,Seed and Inputs System,
N51,SLeSCA HQ operational for seed certification oversight.,Outputs,Seed and Inputs System,
N52,Capacity for seed testing is increased.,Outputs,Seed and Inputs System,
N53,SLeSCA receives financial support.,Outputs,Seed and Inputs System,
N54,SLeSCA field and laboratory technicians are trained.,Outputs,Seed and Inputs System,
N55,"Farmers increase adoption of certified and improved 
seeds/planting material (rice, maize, cocoa, oil palm, vegetables, tubers) and inputs.",Intermediate outcome 1,Seed and Inputs System,
N56,"Seed entities and out-grower producers expand seed multiplication 
and processing capacity using improved infrastructure and mechanized equipment.",Intermediate outcome 1,Seed and Inputs System,
N57,"National institutions (labs, SLeSCA) conduct regular testing and 
certification, assuring seed quality and compliance with standards.",Intermediate outcome 1,Seed and Inputs System,
N58,Improved crop growth.,Intermediate outcome 2,Seed and Inputs System,
N59,Higher germination rates and more uniform crop establishment.,Intermediate outcome 2,Seed and Inputs System,
N60,"Crops (rice, maize, cocoa, vegetables, tubers, oil palm) are more resilient 
to pests, diseases, and climate stresses.",Intermediate outcome 2,Seed and Inputs System,
N61,Increased availability of quality/certified seed.,Intermediate outcome 2,Seed and Inputs System,
N62,Counterfeit and poor-quality inputs reduced through stronger certification and oversight.,Intermediate outcome 2,Seed and Inputs System,
N63,Farmers trust input markets and adopt improved inputs with greater confidence.,Intermediate outcome 2,Seed and Inputs System,
N64,Increased agricultural production,Final outcome,,
N65,Improved agricultural productivity and efficiency,Final outcome,,
N66,"Revamp and operationalize the Food and Nutrition 
Security Early Warning System (FNS-EWS) (FSRP)",Activities,"AgTech and Climate Smart
Agriculture",Digital Infrastructure for Agriculture
N67,Establish weather stations across the agricultural districts (FSRP)  (FSRP),Activities,"AgTech and Climate Smart
Agriculture",Digital Infrastructure for Agriculture
N68,Establish Soil digital information system (FSRP),Activities,"AgTech and Climate Smart
Agriculture",Digital Infrastructure for Agriculture
N69,Establish digital farmer registry (FSRP),Activities,"AgTech and Climate Smart
Agriculture",Digital Infrastructure for Agriculture
N70,"Revamp and operate the national e-extension platform
 (IVR 899, call center, SMS/WhatsApp advisory system) (FSRP, SCADEP)  (FSRP)",Activities,"AgTech and Climate Smart
Agriculture",Digital Infrastructure for Agriculture
N71,Train extension agents in use of digital and CSA tools (FSRP),Activities,"AgTech and Climate Smart
Agriculture",Digital Infrastructure for Agriculture
N72,"Establish demonstration plots / FFS to train farmers on GAPs 
(including Integrated Soil Fertility Management), 
climate smart agriculture and adoption of improved inputs 
through key value chain. (RAIC, AVDP, RRVCP)",Activities,"AgTech and Climate Smart
Agriculture",Digital Infrastructure for Agriculture
N73,Establishment of National Rural Farmers Radio. (RFCIP),Activities,"AgTech and Climate Smart
Agriculture",Digital Infrastructure for Agriculture
N74,Farmers and policymakers receive timely early warning information,Outputs,"AgTech and Climate Smart
Agriculture",
N75,Farmers have access to operational weather stations.,Outputs,"AgTech and Climate Smart
Agriculture",
N76,Farmers have access to a national soil information system.,Outputs,"AgTech and Climate Smart
Agriculture",
N77,Farmers are registered in the digital farmer registries.,Outputs,"AgTech and Climate Smart
Agriculture",
N78,"Farmers have access to a functional e-extension platform (IVR 899, call center, SMS/WhatsApp).",Outputs,"AgTech and Climate Smart
Agriculture",
N79,Extension agents are equipped with skills to use digital platforms and CSA tools.,Outputs,"AgTech and Climate Smart
Agriculture",
N80,"Farmers are trained on GAPs (including Integrated Soil Fertility Management), 
CSA practices, and improved inputs.",Outputs,"AgTech and Climate Smart
Agriculture",
N81,"Farmers have access to regular radio broadcasts on best agronomic practices, 
markets, and weather updates.",Outputs,"AgTech and Climate Smart
Agriculture",
N82,"Farmers and policymakers use timely digital information for 
decision-making (planning, crisis response, and crop management).",Intermediate Outcome 1,"AgTech and Climate Smart
Agriculture",
N83,Farmers adopt soil- and site-specific practices to improve productivity and resilience.,Intermediate Outcome 1,"AgTech and Climate Smart
Agriculture",
N84,"Farmers are more visible and better targeted by projects and 
the government for services and support.",Intermediate Outcome 1,"AgTech and Climate Smart
Agriculture",
N85,Farmers receive timely advice and input support that improves input use and farm practices.,Intermediate Outcome 1,"AgTech and Climate Smart
Agriculture",
N86,"Farmers adopt Good Agricultural Practices (GAPs), 
Integrated Soil Fertility Management (ISFM), and 
Climate Smart Agriculture (CSA) practices across key value chains.",Intermediate Outcome 1,"AgTech and Climate Smart
Agriculture",
N88,"Farmers have better anticipation and management of 
agricultural risks (pests, diseases, climate shocks).",Intermediate Outcome 2,"AgTech and Climate Smart
Agriculture",
N89,Policy responses are more evidence-based and timely.,Intermediate Outcome 2,"AgTech and Climate Smart
Agriculture",
N90,Improved soil fertility and long-term sustainability of farming systems.,Intermediate Outcome 2,"AgTech and Climate Smart
Agriculture",
N92,"Fairer and more efficient distribution of subsidies, inputs, and extension services.",Intermediate Outcome 2,"AgTech and Climate Smart
Agriculture",
N93,Stronger inclusion of smallholder farmers in national programs.,Intermediate Outcome 2,"AgTech and Climate Smart
Agriculture",
N94,"Reduced crop losses and more efficient input use (fertilizer, seed, pesticides).",Intermediate Outcome 2,"AgTech and Climate Smart
Agriculture",
N95,Stronger resilience of farmers and the agricultural system,Final outcome,,
N96,More inclusive and competitive agricultural markets,Final outcome,,
N97,"Construct and rehabilitate grain stores, warehouses, and drying floors (AVDP, RRVCP, RAIC)",Activities,"Aggregation processing 
and Market Linkage","Storage and Post-Harvest 
Infrastructure"
N98,Construct cold rooms and storage facilities for perishables (AVDP),Activities,"Aggregation processing 
and Market Linkage","Storage and Post-Harvest 
Infrastructure"
N99,Construct/Rehabilitate storage facilities for the food reserve system (FSRP),Activities,"Aggregation processing 
and Market Linkage","Storage and Post-Harvest
 Infrastructure"
N100,Estabilsh storage facilities within Agribusiness Centers (AVDP),Activities,"Aggregation processing 
and Market Linkage","Storage and Post-Harvest
 Infrastructure"
N101,Construct and equip industrial clusters for agro-processing (RAIC),Activities,"Aggregation processing 
and Market Linkage",Agro-Processing and Value Addition
N102,"Procure, install, and rehabilitate rice mills, parboiling units, 
boilers, dryers, and related equipment (RRVCP)",Activities,"Aggregation processing 
and Market Linkage",Agro-Processing and Value Addition
N103,"Setting up management committees and training them to manage 
rice mills, parboiling etc. (RRVCP)",Activities,"Aggregation processing 
and Market Linkage",Agro-Processing and Value Addition
N104,"Capacity building of FBOs, aggregators, and produce buyers on contract farming. (RRVCP)",Activities,"Aggregation processing 
and Market Linkage",Agro-Processing and Value Addition
N105,"Construct and rehabilitate rural and open market facilities (RRVCP, SCADeP)",Activities,"Aggregation processing 
and Market Linkage",Market Access and Infrastructure
N106,Market Sites identification and rehabilitation along regional corridors (FSRP),Activities,"Aggregation processing 
and Market Linkage",Market Access and Infrastructure
N107,"Facilitate multi-stakeholder market platforms through regular meetings 
and broker linkages/contracts between farmer groups and off-takers/buyers (RRVCP, AVDP).",Activities,"Aggregation processing 
and Market Linkage",Market Access and Infrastructure
N108,"Develop agricultural market information system AMIS (SCADeP, FSRP, PEMSD)",Activities,"Aggregation processing 
and Market Linkage",Market Access and Infrastructure
N109,"Rehabilitate rural roads and feeder roads (RRVCP, AVDP)",Activities,"Aggregation processing 
and Market Linkage",Market Access and Infrastructure
N110,"Construct bridges, culverts, embankments, and spot improvements (SCADeP)",Activities,"Aggregation processing 
and Market Linkage",Market Access and Infrastructure
N111,"Strengthen farmer groups/cooperatives and ABCs for aggregation, 
marketing, and value addition through training and business development (RRVCP, AVDP, RAIC)",Activities,"Aggregation processing 
and Market Linkage",Market Access and Infrastructure
N112,"Farmers and cooperatives have access to functional grain stores, warehouses, and drying floors.",Outputs,"Aggregation processing 
and Market Linkage",
N113,"Farmers, cooperatives, and traders have access to improved storage
 infrastructure for both perishables and staples.",Outputs,"Aggregation processing 
and Market Linkage",
N114,Farmers and SMEs have access to functional industrial clusters for agro-processing.,Outputs,"Aggregation processing 
and Market Linkage",
N115,"Farmer cooperatives, women’s groups, and SMEs have access to rice mills, 
parboiling units, boilers, dryers, and related equipment.",Outputs,"Aggregation processing 
and Market Linkage",
N116,"Management committees are established and trained to operate and 
maintain rice mills, parboiling units, and related processing facilities.",Outputs,"Aggregation processing 
and Market Linkage",
N117,"FBOs, aggregators, and produce buyers trained on contract farming.",Outputs,"Aggregation processing 
and Market Linkage",
N118,Farmers have access to rural and open market facilities.,Outputs,"Aggregation processing 
and Market Linkage",
N119,"Farmers and traders have access to rehabilitated market sites 
along regional corridors for cross-border trade",Outputs,"Aggregation processing 
and Market Linkage",
N120,"Farmers, FBOs, and cooperatives are linked to off-takers and buyers 
through regular multi-stakeholder market platforms.",Outputs,"Aggregation processing 
and Market Linkage",
N121,"Farmers, FBOs, cooperatives, and policymakers access market information 
through the Agricultural Market Information System (AMIS).",Outputs,"Aggregation processing 
and Market Linkage",
N122,"Farmers, FBOs, and cooperatives have access to rehabilitated rural and feeder roads.",Outputs,"Aggregation processing 
and Market Linkage",
N123,"Farmers, FBOs, and cooperatives benefit from improved bridges, culverts, 
embankments, and spot improvements.",Outputs,"Aggregation processing 
and Market Linkage",
N124,"Farmer groups, cooperatives, and ABCs are trained and strengthened for aggregation, 
marketing, and value addition.",Outputs,"Aggregation processing 
and Market Linkage",
N125,Farmers and cooperatives use storage and reserve facilities to store crops.,Intermediate Outcome 1,"Aggregation processing 
and Market Linkage",
N126,"Farmers and SMEs use agro-processing equipment to mill, parboil, and dry products.",Intermediate Outcome 1,"Aggregation processing 
and Market Linkage",
N127,"FBOs, aggregators, and buyers apply contract farming practices.",Intermediate Outcome 1,"Aggregation processing 
and Market Linkage",
N128,"Farmers, cooperatives, and traders use market facilities and platforms 
to sell produce and connect with buyers",Intermediate Outcome 1,"Aggregation processing 
and Market Linkage",
N129,"Farmers, cooperatives, and policymakers use AMIS data for market and policy decisions.",Intermediate Outcome 1,"Aggregation processing 
and Market Linkage",
N130,Farmers and cooperatives use rehabilitated roads and bridges to reach markets.,Intermediate Outcome 1,"Aggregation processing 
and Market Linkage",
N131,"Farmer groups, Cooperatives and ABCs apply aggregation, marketing, and value-add skills.",Intermediate Outcome 1,"Aggregation processing 
and Market Linkage",
N132,Post-harvest losses decrease.,Intermediate Outcome 2,"Aggregation processing 
and Market Linkage",
N133,Food reserves are more reliable during lean seasons.,Intermediate Outcome 2,"Aggregation processing 
and Market Linkage",
N134,"Crops are milled, parboiled, or dried more efficiently.",Intermediate Outcome 2,"Aggregation processing 
and Market Linkage",
N135,"Quality of processed products improves (better grading, packaging).",Intermediate Outcome 2,"Aggregation processing 
and Market Linkage",
N136,Farmers secure more predictable markets and prices.,Intermediate Outcome 2,"Aggregation processing 
and Market Linkage",
N137,Farmers reach more buyers in organized spaces.,Intermediate Outcome 2,"Aggregation processing 
and Market Linkage",
N138,Transactions with off-takers are more transparent.,Intermediate Outcome 2,"Aggregation processing 
and Market Linkage",
N139,Policymakers make better evidence-based market interventions.,Intermediate Outcome 2,"Aggregation processing 
and Market Linkage",
N140,Farmers get timely price information.,Intermediate Outcome 2,"Aggregation processing 
and Market Linkage",
N141,Transport costs and travel time are reduced.,Intermediate Outcome 2,"Aggregation processing 
and Market Linkage",
N142,Produce reaches markets in better condition.,Intermediate Outcome 2,"Aggregation processing 
and Market Linkage",
N143,Groups organize collective sales more effectively.,Intermediate Outcome 2,"Aggregation processing 
and Market Linkage",
N144,Cooperatives negotiate better terms with buyers.,Intermediate Outcome 2,"Aggregation processing 
and Market Linkage",
N145,"Disbursement of agricultural loans to farmers and FBOs, 
with a focus on women and youth groups (RFCIP, RRVCP).",Activities,Agricultural Finance,Rural Finance and Credit
N146,"Establish a Microfinance Unit at the Apex Bank 
with dedicated staff and expertise (RRVCP).",Activities,Agricultural Finance,Rural Finance and Credit
N147,"Complete construction of the new Apex Bank headquarters 
and regional offices (RFCIP).",Activities,Agricultural Finance,Rural Finance and Credit
N148,"Establishment of a USD 10 million Bank of Sierra Leone (BSL) 
credit facility disbursing loans to agribusinesses (FSRP).",Activities,Agricultural Finance,Rural Finance and Credit
N149,"Digitalization of the Rural Finance Network to link community banks, 
Apex Bank, and Financial services (RFCIP).",Activities,Agricultural Finance,Rural Finance and Credit
N150,"Capacity building of Rural and Community Banks (RCBs) and farmer 
cooperatives for improved agricultural lending (RRVCP, RFCIP).",Activities,Agricultural Finance,"Capacity and Institutional 
Strengthening"
N151,"Facilitate financial literacy and training for FBOs, SMEs, 
and youth/women groups to access credit (RRVCP, RAIC).",Activities,Agricultural Finance,"Capacity and Institutional 
Strengthening"
N152,"Strengthen Apex Bank as intermediary between 
commercial banks and RFIs for agricultural credit lines (RRVCP, BSL).",Activities,Agricultural Finance,"Capacity and Institutional 
Strengthening"
N153,"Roll-out of Weather-Index Crop Insurance for smallholder farmers (FSRP, RRVCP).",Activities,Agricultural Finance,Risk Management
N154,"Link farmers to insurance products bundled 
with credit facilities (FSRP, RRVCP, insurance companies).",Activities,Agricultural Finance,Risk Management
N155,"Farmers and FBOs, especially women and youth, have access to agricultural loans.",Outputs,Agricultural Finance,
N156,A fully functional Microfinance Unit with dedicated staff is available at Apex Bank.,Outputs,Agricultural Finance,
N157,Apex Bank operates from a completed headquarter to support rural financial services.,Outputs,Agricultural Finance,
N158,Agribusinesses have access to a credit facility.,Outputs,Agricultural Finance,
N159,"Community banks, FSAs, and Apex Bank are digitally connected for efficient service delivery.",Outputs,Agricultural Finance,
N160,"Rural and Community Banks and farmer cooperatives receive 
capacity building for agricultural lending.",Outputs,Agricultural Finance,
N161,"FBOs, SMEs, and youth/women groups benefit from financial literacy and training to access credit.",Outputs,Agricultural Finance,
N162,"Apex Bank is strengthened as an intermediary channeling credit lines 
from commercial banks to RCBs.",Outputs,Agricultural Finance,
N163,Smallholder farmers have access to Weather-Index Crop Insurance.,Outputs,Agricultural Finance,
N164,Farmers have access to insurance products bundled with credit facilities.,Outputs,Agricultural Finance,
N165,"Farmers and FBOs use loans to purchase inputs, expand cultivated area,
 and invest in productive assets and services.",Intermediate outcome 1,Agricultural Finance,
N166,"Apex Bank uses improved institutional capacity and infrastructure to manage
 microfinance operations, expand services, and support rural lending.",Intermediate outcome 1,Agricultural Finance,
N167,"Agribusinesses use credit to invest in processing, storage, distribution, and market activities.",Intermediate outcome 1,Agricultural Finance,
N168,"Farmers, FBOs, and rural banks use digital financial services to save, 
transfer, and access credit more efficiently.",Intermediate outcome 1,Agricultural Finance,
N169,"RCBs and cooperatives apply improved lending practices to extend 
more and better-quality credit to farmers.",Intermediate outcome 1,Agricultural Finance,
N170,"Farmers, SMEs, and vulnerable groups apply financial knowledge to 
qualify for and effectively use credit.",Intermediate outcome 1,Agricultural Finance,
N171,"Farmers use insurance products (standalone or bundled with credit) to manage 
climate and production risks",Intermediate outcome 1,Agricultural Finance,
N172,Farmers expand production capacity and improve efficiency by effectively using the credit.,Intermediate outcome 2,Agricultural Finance,
N173,"Rural financial institutions expand outreach, improve credit quality, 
and provide sustainable services to farming communities.",Intermediate outcome 2,Agricultural Finance,
N174,"Processing, storage, and market capacity of agribusinesses expands along value chains.",Intermediate outcome 2,Agricultural Finance,
N175,"Transaction costs decrease, financial inclusion improves, 
and rural households integrate into the formal financial system.",Intermediate outcome 2,Agricultural Finance,
N176,"Farmers stabilize their income, protect assets, and 
maintain creditworthiness even after climate shocks or crop failures.",Intermediate outcome 2,Agricultural Finance,
N177,Expanded and sustainable access to agricultural finance,Final outcome,,
N178,"Train women and youth on entrepreneurship, agribusiness
 and GALS (Gender Action Learning System), 
GBV, FGM, GEWE etc. (RAIC, AVDP, SLARiS, RRVCP)",Activities,"Women and Youth 
Empowerment",Capacity Building and Strengthening
N179,"Train youths on fabrication, maintenance, and 
operating of rice processing equipment and machines (RAIC)",Activities,"Women and Youth 
Empowerment",Capacity Building and Strengthening
N180,Facilitate the registration of women/youth groups in rice and vegetable value chains (RRVCP),Activities,"Women and Youth 
Empowerment",Capacity Building and Strengthening
N181,Facilitate community meetings and sensitization on women and youth  issues (RRVCP),Activities,"Women and Youth 
Empowerment",Capacity Building and Strengthening
N182,"Train young fabricators in thresher production, 
and provide grants for youth groups to run thresher service businesses. (RAIC)",Activities,"Women and Youth 
Empowerment",Capacity Building and Strengthening
N183,Equipment upgrade for a Workshop at Njala University. (RAIC),Activities,"Women and Youth 
Empowerment",Capacity Building and Strengthening
N184,"Training on Thresher fabrication at Njala University to 
enable the engineering faculty to become a thresher fabrication training centre. (RAIC)",Activities,"Women and Youth 
Empowerment",Capacity Building and Strengthening
N185,"Support for postgraduate training for youth in specialized areas 
(Irrigation Engineering, Hydrology, Food Safety, and Food Technology) 
through Njala University and partner institutions. (RAIC)",Activities,"Women and Youth 
Empowerment",Capacity Building and Strengthening
N186,"Financing Youths to access power tillers and commence 
mechanisation services through the MAF machine ring. (RAIC)",Activities,"Women and Youth 
Empowerment",Inclusive Financing and Support
N187,Provide grants for youth groups to run thresher service businesses. (RAIC),Activities,"Women and Youth 
Empowerment",Inclusive Financing and Support
N188,"Women and youth are trained on entrepreneurship, agribusiness, GALS, 
and received sensitization on GBV, FGM, and GEWE.",Outputs,"Women and Youth 
Empowerment",
N189,"Youth are trained on fabrication, maintenance, and operating of rice 
processing equipment and machines.",Outputs,"Women and Youth 
Empowerment",
N190,Women and youth groups are facilitated to register in rice and vegetable value chains.,Outputs,"Women and Youth 
Empowerment",
N191,Communities have received sensitization on women and youth issues.,Outputs,"Women and Youth 
Empowerment",
N192,Young fabricators are trained in thresher production,Outputs,"Women and Youth 
Empowerment",
N193,Youth have access to a well equipped Njala University workshop.,Outputs,"Women and Youth 
Empowerment",
N194,"Njala University engineering faculty equipped to function as a thresher fabrication training centre,",Outputs,"Women and Youth 
Empowerment",
N195,"Youth receive postgraduate training in Irrigation Engineering, Hydrology, 
Food Safety, and Food Technology.",Outputs,"Women and Youth 
Empowerment",
N196,Youth have access to power tillers and finance to start mechanisation services.,Outputs,"Women and Youth 
Empowerment",
N197,Youth groups receive grants to operate thresher service businesses.,Outputs,"Women and Youth 
Empowerment",
N198,"Women and youth apply entrepreneurship, agribusiness, and GALS training, 
and communities are sensitized on gender and youth issues",Intermediate outcome 1,"Women and Youth 
Empowerment",
N199,Women and youth groups register and participate in rice and vegetable value chains,Intermediate outcome 1,"Women and Youth 
Empowerment",
N200,"Youths fabricate, operate, and maintain rice processing equipment and threshers.",Intermediate outcome 1,"Women and Youth 
Empowerment",
N201,Youth are recruited into agricultural enterprises,Intermediate outcome 1,"Women and Youth 
Empowerment",
N202,Youth use power tillers to deliver mechanization services,Intermediate outcome 1,"Women and Youth 
Empowerment",
N204,"Women and youth run sustainable agribusinesses, adopt equitable practices, 
and play stronger roles in household and community decision-making.",Intermediate outcome 2,"Women and Youth 
Empowerment",
N205,"Women and youth cooperatives gain visibility, strengthen bargaining power, 
and secure better market opportunities.",Intermediate outcome 2,"Women and Youth 
Empowerment",
N206,Local processing and mechanization services expand.,Intermediate outcome 2,"Women and Youth 
Empowerment",
N207,"Youths have income from fabrication, operation, and maintenance services.",Intermediate outcome 2,"Women and Youth 
Empowerment",
N208,Youth strengthen the performance and innovation capacity of agricultural enterprises,Intermediate outcome 2,"Women and Youth 
Empowerment",
N209,Greater participation and empowerment of women and youth,Final outcome,,
N210,Reduced Import Bills for Staples,Impact,,
N211,Improved climate resilience,Impact,,
N212,Improved food security,Impact,,
N213,Higher earnings from exports,Impact,,
N214,Job Creation,Impact,,
N215,,,
N216,,,
N217,,,
N218,,,
N219,,,
N220,,,
N221,,,
N222,,,
N223,,,
N224,,,
N225,,,
`;

const EDGES_CSV = `Source_id,target_id,connection_type
N1,N12,leads to
N2,N13,leads to
N3,N13,leads to
N4,N13,leads to
N5,N13,leads to
N6,N13,leads to
N7,N14,leads to
N8,N15,leads to
N9,N16,leads to
N10,N17,leads to
N11,N18,leads to
N12,N19,leads to
N13,N19,leads to
N14,N19,leads to
N15,N19,leads to
N16,N19,leads to
N17,N20,leads to
N18,N21,leads to
N19,N22,leads to
N19,N23,leads to
N19,N24,leads to
N20,N25,leads to
N20,N26,leads to
N21,N27,leads to
N21,N28,leads to
N22,N64,leads to
N23,N64,leads to
N24,N64,leads to
N25,N65,leads to
N26,N65,leads to
N27,N65,leads to
N28,N65,leads to
N29,N44,leads to
N30,N45,leads to
N31,N45,leads to
N32,N45,leads to
N33,N47,leads to
N34,N48,leads to
N35,N46,leads to
N36,N50,leads to
N37,N45,leads to
N38,N45,leads to
N39,N50,leads to
N40,N51,leads to
N41,N52,leads to
N42,N53,leads to
N43,N54,leads to
N44,N55,leads to
N45,N55,leads to
N46,N56,leads to
N47,N56,leads to
N48,N56,leads to
N48,N55,leads to
N49,N56,leads to
N50,N55,leads to
N51,N57,leads to
N52,N57,leads to
N53,N57,leads to
N54,N57,leads to
N55,N58,leads to
N55,N59,leads to
N55,N60,leads to
N56,N61,leads to
N57,N62,leads to
N57,N63,leads to
N58,N65,leads to
N59,N64,leads to
N60,N64,leads to
N61,N64,leads to
N62,N64,leads to
N63,N64,leads to
N64,N210,leads to
N64,N212,leads to
N64,N214,leads to
N65,N210,leads to
N65,N211,leads to
N65,N212,leads to
N65,N213,leads to
N66,N74,leads to
N67,N75,leads to
N68,N76,leads to
N69,N77,leads to
N70,N78,leads to
N71,N79,leads to
N72,N80,leads to
N73,N81,leads to
N74,N82,leads to
N75,N82,leads to
N76,N83,leads to
N77,N84,leads to
N78,N85,leads to
N79,N85,leads to
N80,N86,leads to
N81,N82,leads to
N82,N88,leads to
N82,N89,leads to
N83,N22,leads to
N83,N90,leads to
N84,N92,leads to
N84,N93,leads to
N85,N94,leads to
N86,N23,leads to
N86,N58,leads to
N86,N60,leads to
N86,N90,leads to
N86,N94,leads to
N88,N95,leads to
N89,N95,leads to
N90,N65,leads to
N92,N96,leads to
N93,N96,leads to
N94,N65,leads to
N95,N211,leads to
N95,N212,leads to
N96,N213,leads to
N96,N212,leads to
N96,N214,leads to
N97,N112,leads to
N98,N113,leads to
N99,N113,leads to
N100,N113,leads to
N101,N114,leads to
N102,N115,leads to
N103,N116,leads to
N104,N117,leads to
N105,N118,leads to
N106,N119,leads to
N107,N120,leads to
N108,N121,leads to
N109,N122,leads to
N110,N123,leads to
N111,N124,leads to
N112,N125,leads to
N113,N125,leads to
N114,N126,leads to
N115,N126,leads to
N116,N126,leads to
N117,N127,leads to
N118,N128,leads to
N119,N128,leads to
N120,N128,leads to
N121,N129,leads to
N122,N130,leads to
N123,N130,leads to
N124,N131,leads to
N125,N132,leads to
N125,N133,leads to
N126,N134,leads to
N126,N135,leads to
N127,N136,leads to
N128,N137,leads to
N128,N138,leads to
N129,N139,leads to
N129,N140,leads to
N130,N141,leads to
N130,N142,leads to
N131,N143,leads to
N131,N144,leads to
N131,N135,leads to
N132,N64,leads to
N133,N64,leads to
N134,N65,leads to
N135,N65,leads to
N136,N96,leads to
N137,N96,leads to
N138,N96,leads to
N139,N96,leads to
N140,N96,leads to
N141,N96,leads to
N142,N96,leads to
N143,N96,leads to
N144,N96,leads to
N145,N155,leads to
N146,N156,leads to
N147,N157,leads to
N148,N158,leads to
N149,N159,leads to
N150,N160,leads to
N151,N161,leads to
N152,N162,leads to
N153,N163,leads to
N154,N164,leads to
N155,N165,leads to
N156,N166,leads to
N157,N166,leads to
N158,N167,leads to
N159,N168,leads to
N160,N169,leads to
N161,N170,leads to
N162,N166,leads to
N163,N171,leads to
N164,N171,leads to
N165,N19,contributes to
N165,N20,contributes to
N165,N21,contributes to
N165,N55,contributes to
N165,N125,contributes to
N165,N126,contributes to
N165,N172,leads to
N166,N173,leads to
N167,N174,leads to
N168,N175,leads to
N169,N173,leads to
N170,N172,leads to
N171,N176,leads to
N172,N64,leads to
N172,N65,leads to
N173,N177,leads to
N174,N96,leads to
N175,N177,leads to
N176,N95,leads to
N177,N210,leads to
N177,N211,leads to
N177,N214,leads to
N178,N188,leads to
N179,N189,leads to
N180,N190,leads to
N181,N191,leads to
N182,N192,leads to
N183,N193,leads to
N184,N194,leads to
N185,N195,leads to
N186,N196,leads to
N187,N197,leads to
N188,N198,leads to
N189,N200,leads to
N190,N199,leads to
N191,N198,leads to
N192,N200,leads to
N193,N200,leads to
N194,N200,leads to
N195,N201,leads to
N196,N202,leads to
N197,N200,leads to
N198,N204,leads to
N199,N205,leads to
N200,N206,leads to
N200,N207,leads to
N201,N208,leads to
N202,N26,leads to
N202,N206,leads to
N204,N209,leads to
N205,N209,leads to
N206,N209,leads to
N206,N65,leads to
N207,N209,leads to
N208,N209,leads to
N209,N213,leads to
N209,N212,leads to
N209,N214,leads to
`;

function mergeWrappedCsvLines(raw) {
  const lines = raw.split(/\r?\n/);
  const rows = [];
  let current = '';
  const isNewRow = (s) => /^N\d+,/.test(s);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    if (isNewRow(line)) {
      if (current) rows.push(current);
      current = line;
    } else {
      current += ' ' + line.trim();
    }
  }
  if (current) rows.push(current);
  return rows;
}

function parseCsvLine(line) {
  const result = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(field);
      field = '';
    } else {
      field += ch;
    }
  }
  result.push(field);
  return result.map(s => s.trim());
}

function mapNodeType(csvType) {
  const t = (csvType || '').toLowerCase();
  if (t.startsWith('activity')) return 'activity';
  if (t.startsWith('output')) return 'output';
  if (t.startsWith('intermediate outcome')) return 'intermediate_outcome';
  if (t.startsWith('final outcome')) return 'final_outcome';
  if (t.startsWith('impact')) return 'impact';
  return 'activity';
}

exports.up = async function(db) {
  const nodesCsv = NODES_CSV;
  const edgesCsv = EDGES_CSV;

  // Preprocess nodes CSV to handle wrapped lines
  const nodeLines = mergeWrappedCsvLines(nodesCsv).filter(l => !l.toLowerCase().startsWith('id,'));
  const nodes = nodeLines.map(parseCsvLine).map(cols => ({
    id: cols[0],
    title: cols[1],
    csvType: cols[2],
    pillar: cols[3] || '',
    subpillar: cols[4] || ''
  })).filter(n => n.id && n.title);

  // Connections
  const edgeLines = edgesCsv.split(/\r?\n/).filter(Boolean);
  const edges = edgeLines.filter(l => !l.toLowerCase().startsWith('source_id')).map(parseCsvLine).map(cols => ({
    source: cols[0],
    target: cols[1],
    type: (cols[2] || '').trim().toLowerCase()
  })).filter(e => e.source && e.target);

  // Start transaction
  await db.runSql('BEGIN');
  try {
    // Find super admin
    const superAdminRes = await db.runSql("SELECT id FROM users WHERE role = 'super_admin' LIMIT 1");
    if (superAdminRes.rows.length === 0) {
      throw new Error('Super admin user not found');
    }
    const superAdminId = superAdminRes.rows[0].id;

    // Create board
    const boardRes = await db.runSql(
      `INSERT INTO boards (title, description, is_public, settings)
       VALUES ($1, $2, true, $3) RETURNING id`,
      ['Feed Salone Theory of Change - Full',
       'Full Feed Salone ToC imported from CSV nodes and connections.',
       JSON.stringify({ showLabels: true, autoLayout: true })]
    );
    const boardId = boardRes.rows[0].id;

    // Owner permission
    await db.runSql(
      `INSERT INTO board_permissions (board_id, user_id, role, granted_by)
       VALUES ($1, $2, 'owner', $2)`,
      [boardId, superAdminId]
    );

    // Create lists
    const listDefs = [
      { name: 'Activities', type: 'fixed', color: '#ef4444' },
      { name: 'Outputs', type: 'fixed', color: '#f59e0b' },
      { name: 'Intermediate Outcome 1', type: 'intermediate', color: '#3b82f6' },
      { name: 'Intermediate Outcome 2', type: 'intermediate', color: '#8b5cf6' },
      { name: 'Final Outcomes', type: 'fixed', color: '#10b981' },
      { name: 'Impact', type: 'fixed', color: '#06b6d4' }
    ];
    const listIds = [];
    for (const def of listDefs) {
      const r = await db.runSql(
        `INSERT INTO board_lists (board_id, name, type, color) VALUES ($1, $2, $3, $4) RETURNING id`,
        [boardId, def.name, def.type, def.color]
      );
      listIds.push(r.rows[0].id);
    }
    const [activitiesListId, outputsListId, int1ListId, int2ListId, finalListId, impactListId] = listIds;

    await db.runSql(`UPDATE boards SET list_ids = $1 WHERE id = $2`, [JSON.stringify(listIds), boardId]);

    // Insert nodes and map csv id -> db id
    const idMap = new Map();
    const numericId = (s) => parseInt((s || '').replace(/\D+/g, ''), 10) || 0;
    const nodesSorted = nodes.slice().sort((a,b) => numericId(a.id) - numericId(b.id));
    for (const n of nodesSorted) {
      const typeMapped = mapNodeType(n.csvType);
      const tags = [];
      if (n.pillar) tags.push(n.pillar.replace(/\s+/g, ' ').trim());
      if (n.subpillar) tags.push(n.subpillar.replace(/\s+/g, ' ').trim());
      const ins = await db.runSql(
        `INSERT INTO board_nodes (title, type, tags) VALUES ($1, $2, $3) RETURNING id`,
        [n.title, typeMapped, JSON.stringify(tags)]
      );
      idMap.set(n.id, ins.rows[0].id);
    }

    // Update list node_ids by csv type buckets
    function idsFor(filterFn) {
      return nodesSorted.filter(filterFn).map(n => idMap.get(n.id)).filter(Boolean);
    }
    await db.runSql(`UPDATE board_lists SET node_ids = $1 WHERE id = $2`, [JSON.stringify(idsFor(n => /^activities?/i.test(n.csvType))), activitiesListId]);
    await db.runSql(`UPDATE board_lists SET node_ids = $1 WHERE id = $2`, [JSON.stringify(idsFor(n => /^outputs?/i.test(n.csvType))), outputsListId]);
    await db.runSql(`UPDATE board_lists SET node_ids = $1 WHERE id = $2`, [JSON.stringify(idsFor(n => /^intermediate outcome\s*1/i.test(n.csvType))), int1ListId]);
    await db.runSql(`UPDATE board_lists SET node_ids = $1 WHERE id = $2`, [JSON.stringify(idsFor(n => /^intermediate outcome\s*2/i.test(n.csvType))), int2ListId]);
    await db.runSql(`UPDATE board_lists SET node_ids = $1 WHERE id = $2`, [JSON.stringify(idsFor(n => /^final outcome/i.test(n.csvType))), finalListId]);
    await db.runSql(`UPDATE board_lists SET node_ids = $1 WHERE id = $2`, [JSON.stringify(idsFor(n => /^impact/i.test(n.csvType))), impactListId]);

    // Insert edges
    for (const e of edges) {
      const src = idMap.get(e.source);
      const tgt = idMap.get(e.target);
      if (!src || !tgt) continue;
      const edgeType = e.type.includes('contributes') ? 'contributes_to' : 'leads_to';
      await db.runSql(
        `INSERT INTO board_edges (source_node_id, target_node_id, type) VALUES ($1, $2, $3)`,
        [src, tgt, edgeType]
      );
    }

    await db.runSql('COMMIT');
  } catch (err) {
    await db.runSql('ROLLBACK');
    throw err;
  }
};

exports.down = async function(db) {
  await db.runSql('BEGIN');
  try {
    const bres = await db.runSql(`SELECT id FROM boards WHERE title = $1 LIMIT 1`, ['Feed Salone Theory of Change - Full']);
    if (bres.rows.length) {
      const boardId = bres.rows[0].id;
      // Collect list node ids
      const lres = await db.runSql(`SELECT id, node_ids FROM board_lists WHERE board_id = $1`, [boardId]);
      const nodeIds = [];
      for (const row of lres.rows) {
        try {
          const arr = Array.isArray(row.node_ids) ? row.node_ids : JSON.parse(row.node_ids || '[]');
          for (const id of arr) nodeIds.push(id);
        } catch (_) {}
      }
      // Delete lists
      await db.runSql(`DELETE FROM board_lists WHERE board_id = $1`, [boardId]);
      // Delete nodes (edges will cascade)
      if (nodeIds.length) {
        await db.runSql(`DELETE FROM board_nodes WHERE id = ANY($1)`, [nodeIds]);
      }
      // Delete permissions then board
      await db.runSql(`DELETE FROM board_permissions WHERE board_id = $1`, [boardId]);
      await db.runSql(`DELETE FROM boards WHERE id = $1`, [boardId]);
    }
    await db.runSql('COMMIT');
  } catch (err) {
    await db.runSql('ROLLBACK');
    throw err;
  }
};

exports._meta = {
  version: 1
};


