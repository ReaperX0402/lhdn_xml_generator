/**
 * Lampiran Lookup Tables
 * Source: Spesifikasi XML Penyeteman Berkelompok 3.4.pdf, Lampiran C-F.
 */

window.EDutiLampiran = (function () {
  const COUNTRY_CODES = {
    "1": "ANDORA",
    "2": "UNITED ARAB EMIRATES",
    "3": "AFGHANISTAN",
    "4": "ANTIGUA AND BARBUDA",
    "5": "ALBANIA",
    "6": "NETHERLANDS ANTILLES",
    "7": "ANGOLA",
    "8": "ARGENTINA",
    "9": "AMERICAN SAMOA",
    "10": "AUSTRIA",
    "11": "AUSTRALIA",
    "12": "ARUBA",
    "13": "AZERBAIDJAN",
    "14": "BARBADOS",
    "15": "BANGLADESH",
    "16": "BELGIUM",
    "17": "BURKINA FASO",
    "18": "BULGARIA",
    "19": "BAHRAIN",
    "20": "BURUNDI",
    "21": "BENIN",
    "22": "BELARUS",
    "23": "BERMUDA",
    "24": "BRUNEI DARUSSALAM",
    "25": "BOLIVIA",
    "26": "BRAZIL",
    "27": "BAHAMAS",
    "28": "BHUTAN",
    "29": "BOUVET ISLAND",
    "30": "BOTSWANA",
    "31": "BYELORUSSIAN",
    "32": "BELIZE",
    "33": "CANADA",
    "34": "COCOS ISLAND",
    "35": "CHANNEL ISLAND",
    "36": "CENTRAL AFRICAN REPUBLIC",
    "37": "REPUBLIC OF THE CONGO",
    "38": "SWITZERLAND",
    "39": "COTE DIVOIRE",
    "40": "COOK ISLANDS",
    "41": "CHILE",
    "42": "CAMEROON",
    "43": "CHINA",
    "44": "COLOMBIA",
    "45": "COSTA RICA",
    "46": "CZECH REPUBLIC",
    "47": "CROATIA",
    "48": "CUBA",
    "49": "CAPE VERDE",
    "50": "CHRISTMAS ISLANDS",
    "51": "CYPRUS",
    "52": "GERMANY",
    "53": "DJIBOUTI",
    "54": "DENMARK",
    "55": "DOMINICA",
    "57": "DOMINICAN REPUBLIC",
    "58": "ALGERIA",
    "59": "ECUADOR",
    "60": "EGYPT",
    "61": "WESTERN SAHARA",
    "62": "ERITREA",
    "63": "SPAIN",
    "64": "ETHIOPIA",
    "65": "NEGARA-NEGARA EROPAH",
    "66": "FINLAND",
    "67": "FIJI",
    "68": "FALKLAND ISLANDS (MALVINAS)",
    "69": "MICRONESIA",
    "70": "FAEROE ISLANDS",
    "71": "FRANCE",
    "72": "GABON",
    "73": "UNITED KINGDOM OF GREAT BRITAIN AND NORTHERN IRELAND",
    "74": "GRENADA",
    "75": "FRENCH GUIANA",
    "76": "GHANA",
    "77": "GIBRALTAR",
    "78": "GREENLAND",
    "79": "GAMBIA",
    "80": "GUINEA",
    "81": "GUADELOUPE",
    "82": "EQUATORIAN GUINEA",
    "83": "GREECE",
    "84": "GUATEMALA",
    "85": "GUAM",
    "86": "GUINEA-BISSAU",
    "87": "GUYANA",
    "89": "HONG KONG",
    "90": "HEARD AND MCDONALD ISLANDS",
    "91": "HONDURAS",
    "92": "HAITI",
    "93": "HUNGARY",
    "94": "IVORY COAST",
    "95": "INDONESIA",
    "96": "IRELAND",
    "97": "ISRAEL",
    "98": "ISLE OF MAN",
    "99": "INDIA",
    "100": "BRITISH INDIAN OCEAN TERRITORY",
    "101": "IRAQ",
    "102": "ISLAMIC REPUBLIC OF IRAN",
    "103": "ICELAND",
    "104": "ITALY",
    "105": "JAMAICA",
    "106": "JORDAN",
    "107": "JAPAN",
    "108": "KENYA",
    "109": "KIRGYSTAN",
    "110": "KAMPUCHEA DEMOCRATIC",
    "111": "KIRIBATI",
    "112": "COMOROS",
    "113": "ST.KITTS AND NEVIS",
    "114": "DEMOC.PEOPLES REP.OF KOREA",
    "115": "SOUTH KOREA",
    "116": "KUWAIT",
    "117": "CAYMAN ISLANDS",
    "118": "KAZAKSTAN",
    "119": "LAO PEOPLE DEMOCRATIC REP",
    "120": "LEBANON",
    "121": "SAINT LUCIA",
    "122": "LIECHTENSTEIN",
    "123": "SRI LANKA",
    "124": "LIBERIA",
    "125": "LESOTHO",
    "126": "LUXEMBOURG",
    "127": "LATVIA",
    "128": "LIBYAN ARAB JAMAHIRIYA",
    "129": "MOROCCO",
    "130": "MONACO",
    "131": "MADAGASCAR",
    "132": "REPUBLIC OF THE MARSHALL ISLANDS",
    "133": "MALI",
    "134": "MYANMAR",
    "135": "MONGOLIA",
    "136": "MACAU",
    "137": "NORTHEEN MARIANA ISLANDS",
    "138": "MARTINIQUE",
    "139": "MAURITANIA",
    "140": "MONTSERRAT",
    "141": "MALTA",
    "142": "MAURITIUS",
    "143": "MALDIVES",
    "144": "MALAWI",
    "145": "MEXICO",
    "146": "MALAYSIA",
    "147": "MOZAMBIQUE",
    "148": "NAMIBIA",
    "149": "NEW CALEDONIA",
    "150": "NORTHERN IRELAND",
    "151": "NIGER",
    "152": "NORFOLK ISLAND",
    "153": "NIGERIA",
    "154": "NICARAGUA",
    "155": "HOLAND-NETHERLAND",
    "156": "NORWAY",
    "157": "NEPAL",
    "158": "NAURU",
    "159": "NEUTRAL ZONE",
    "160": "NIUE",
    "161": "NEW ZEALAND",
    "162": "OMAN",
    "163": "PANAMA",
    "164": "PERU",
    "165": "FRENCH POLYNESIA",
    "166": "PAPUA NEW GUINEA",
    "167": "PHILIPPINE",
    "168": "PAKISTAN",
    "169": "POLAND",
    "170": "ST. PIERRE AND MIQUELON",
    "171": "PITCAIRN",
    "172": "PUERTO RICO",
    "173": "PORTUGAL",
    "174": "PALAU",
    "175": "PARAGUAY",
    "176": "QATAR",
    "177": "REUNION",
    "178": "ROMANIA",
    "179": "RUSSIAN FEDERATION",
    "180": "RWANDA",
    "181": "SAUDI ARABIA",
    "182": "SOLOMON ISLANDS",
    "183": "SAN MARINO",
    "184": "SUDAN",
    "185": "SWEDEN",
    "186": "SCOTLAND",
    "187": "SINGAPORE",
    "188": "ST. HELENA",
    "189": "SVALBARD AND JAN MAYEN ISLANDS",
    "190": "SIERRA LEONE",
    "192": "SENEGAL",
    "193": "SOMALIA",
    "194": "SURINAME",
    "195": "SAO TOME AND PRINCIPE",
    "196": "RUSSIA",
    "197": "EL SALVADOR",
    "198": "SYRIAN ARAB REPUBLIC",
    "199": "SWAZILAND",
    "200": "TURKS AND CAICOS ISLANDS",
    "201": "CHAD",
    "202": "FRENCH SOUTHERN TERRITORIES",
    "203": "TOGO",
    "204": "THAILAND",
    "205": "TURKMENISTAN",
    "206": "TAJIKISTAN",
    "207": "TOKELAU",
    "208": "TUNISIA",
    "209": "TONGA",
    "210": "EAST TIMOR",
    "211": "TURKEY",
    "212": "TRINIDAD AND TOBAGO",
    "213": "TUVALU",
    "214": "TAIWAN",
    "215": "TANZANIA UNITED REPUBLIC OF",
    "216": "UKRAINE",
    "217": "UGANDA",
    "218": "US MINOR OUTLYING ISLANDS",
    "219": "UNITED STATES OF AMERICA",
    "220": "URUGUAY",
    "221": "UZBEKISTAN",
    "222": "VATICAN CITY STATE",
    "223": "SAINT VINCENT AND GRENADINES",
    "224": "VENEZUELA",
    "225": "VIRGIN ISLANDS(BRITISH)",
    "226": "VIRGIN ISLANDS(US)",
    "227": "VIETNAM",
    "228": "VANUATU",
    "229": "WESTERN SAMOA",
    "230": "WALLIS AND FUTUNA ISLANDS",
    "231": "WEST INDIES",
    "232": "SAMOA",
    "233": "YEMEN DEMOCRATIC",
    "234": "YEMEN",
    "235": "YUGOSLAVIA",
    "236": "SOUTH AFRICA",
    "237": "ZAMBIA",
    "238": "ZAIRE",
    "239": "ZIMBABWE",
    "240": "SLOVAKIA",
    "241": "REPUBLIC OF ARMENIA",
    "242": "BOSNIA HERZEGOVINA",
    "243": "NORTH KOREA",
    "244": "PALESTINE",
    "245": "UNITED KINGDOM OF GREAT BRITAIN",
    "246": "UNITED KINGDOM OF IRELAND",
    "247": "CAMBODIA",
    "248": "HONG KONG SPECIAL A REGION, PEOPLE'S REPUBLIC OF CHINA",
    "249": "ESTONIA",
    "250": "THE REPUBLIC OF KOREA",
    "251": "SEYCHELLES",
    "252": "REPUBLIC OF SERBIA",
    "253": "REPUBLIKA SLOVENIJA / SLOVENIA",
    "254": "NETHERLANDS",
    "255": "GEORGIA",
    "256": "SOUTH SUDAN",
    "257": "REPUBLIK LITHUANIA",
    "259": "TIMOR-LESTE",
    "260": "JERSEY",
    "261": "REPUBLIC OF NORTH MACEDONIA",
    "262": "REPUBLIC OF MONTENEGRO",
    "263": "SOUTH GEORGIA AND SOUTH SANDWICH ISLANDS",
    "264": "CHINESE TAIPEI",
    "265": "MAYOTTE",
    "266": "MOLDOVA",
    "267": "ALAND ISLAND",
    "268": "ANGUILLA",
    "269": "ANTARCTICA",
    "270": "BONAIRE, SINT EUSTATIUS AND SABA",
    "271": "CONGO",
    "272": "CONGO, THE DEMOCRATIC REPUBLIC",
    "273": "CURACAO",
    "274": "ESWATINI, KINGDOM OF (SWAZILAND)",
    "275": "GUERNSEY",
    "276": "LITHUANIA",
    "277": "REPUBLIC OF CHINA",
    "278": "REPUBLIK OF KOSOVO"
  };

  const TAX_BRANCH_CODES = {
    "1": "Johor Bahru",
    "2": "Melaka",
    "3": "Seremban",
    "4": "Taiping",
    "5": "Ipoh",
    "6": "Teluk Intan",
    "7": "Kota Bahru",
    "9": "Pulau Pinang",
    "10": "Kuantan",
    "12": "Jalan Duta",
    "13": "Kluang",
    "15": "Kuala Terengganu",
    "16": "Shah Alam",
    "17": "Raub",
    "18": "Kangar",
    "19": "KL Bandar",
    "20": "Bukit Mertajam",
    "21": "Klang",
    "22": "Alor Setar",
    "24": "Muar",
    "25": "Cheras",
    "26": "Wangsa Maju",
    "27": "Sungai Petani",
    "28": "Petaling Jaya",
    "29": "Temerloh",
    "30": "Kota Kinabalu",
    "31": "Sandakan",
    "32": "Tawau",
    "33": "Keningau",
    "40": "Kuching",
    "41": "Sibu",
    "42": "Miri",
    "43": "Bintulu",
    "51": "Labuan",
    "52": "Bangi"
  };

  const STATE_CODES = {
    "1": "Johor",
    "2": "Kedah",
    "3": "Kelantan",
    "4": "Melaka",
    "5": "Negeri Sembilan",
    "6": "Pahang",
    "7": "Perak",
    "8": "Perlis",
    "9": "Pulau Pinang",
    "10": "Sabah",
    "11": "Sarawak",
    "12": "Selangor",
    "13": "Terengganu",
    "14": "Wilayah Persekutuan Kuala Lumpur",
    "15": "Wilayah Persekutuan Labuan",
    "16": "Wilayah Persekutuan Putrajaya",
    "17": "Luar Negara"
  };

  const EXEMPTION_CODES = {
    "1070": "P.U.(A) 58/2003",
    "1071": "P.U.(A) 220/2002",
    "1072": "P.U.(A) 170/2000",
    "1073": "P.U.(A) 366/2016",
    "1074": "P.U.(A) 16/2014",
    "1075": "P.U. (A) 180/2013",
    "1076": "P.U. (A) 338/1994",
    "1077": "P.U. (A) 144/1994"
  };

  const REMISSION_CODES = {
    "1071": "P.U.(A) 315/2000",
    "1072": "P.U.(A) 22/2001",
    "1073": "P.U.(A) 85/2007",
    "1074": "P.U.(A) 311/2008",
    "1075": "P.U.(A) 416/2012",
    "1076": "PUA 123",
    "1077": "P.U. (A) 85/2007 & P.U. (A) 31/2008",
    "1078": "P.U. (A) 311/2008 & P.U.(A ) 85",
    "1079": "P.U. (A) 85/2007 & P.U. (A) 31",
    "1080": "P.U (A) 409",
    "1081": "P.U.(A) 423/2010",
    "1082": "P.U. (A) 409 & P.U.(A) 423",
    "1083": "P.U. (A) 476",
    "1084": "P.U. (A) 476",
    "1085": "P.U.(A) 416/2012",
    "1086": "PU(A) 409/2009 & PU(A) 416/2012",
    "1087": "P.U.(A)360/2014",
    "1088": "PU(A)409/2009;PU(A)360/2014",
    "1089": "P.U.(A) 441/2011",
    "1090": "P.U.(A) 308/2016",
    "1091": "PU(A) 308/2016 & PU(A) 360",
    "1092": "P.U. (A) 409/1977",
    "1093": "P.U. (A) 446/2011",
    "1094": "P.U.(A) 82/2008",
    "1095": "P.U. (A) 367/2016",
    "1096": "P.U.(A) 366/2016",
    "1097": "P.U.(A) 366/2016",
    "1098": "P.U. (A) 40/2017",
    "1099": "P.U. (A) 309/2015",
    "1100": "P.U. (A) 285/2013",
    "1101": "P.U. (A) 366/2016",
    "1102": "P.U.(A) 308/2015 & P.U.(A) 366/2016",
    "1103": "PUA 376/2010"
  };

  function normalizeLookupValue(value) {
    return String(value || "")
      .replace(/&amp;/gi, "&")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");
  }

  function buildReverseLookup(codeMap) {
    const reverse = {};
    Object.entries(codeMap).forEach(([code, name]) => {
      const normalizedName = normalizeLookupValue(name);
      if (!reverse[normalizedName]) reverse[normalizedName] = code;
    });
    return reverse;
  }

  const COUNTRY_NAMES = buildReverseLookup(COUNTRY_CODES);
  const TAX_BRANCH_NAMES = buildReverseLookup(TAX_BRANCH_CODES);
  const STATE_NAMES = buildReverseLookup(STATE_CODES);
  const EXEMPTION_NAMES = buildReverseLookup(EXEMPTION_CODES);
  const REMISSION_NAMES = buildReverseLookup(REMISSION_CODES);

  function resolveLookup(value, lookupMap, reverseLookupMap) {
    if (value === undefined || value === null || String(value).trim() === "") {
      return { code: "", isValid: true, matchType: "blank" };
    }

    const strValue = String(value).trim();
    const normalizedValue = normalizeLookupValue(strValue);

    if (lookupMap[strValue]) {
      return { code: strValue, isValid: true, matchType: "code" };
    }

    if (reverseLookupMap[normalizedValue]) {
      const code = reverseLookupMap[normalizedValue];
      return { code, isValid: true, matchType: "name" };
    }

    return { code: null, isValid: false, matchType: "unknown" };
  }

  function resolveCountry(value) {
    return resolveLookup(value, COUNTRY_CODES, COUNTRY_NAMES);
  }

  function resolveTaxBranch(value) {
    return resolveLookup(value, TAX_BRANCH_CODES, TAX_BRANCH_NAMES);
  }

  function resolveState(value) {
    return resolveLookup(value, STATE_CODES, STATE_NAMES);
  }

  function resolveExemption(value) {
    return resolveLookup(value, EXEMPTION_CODES, EXEMPTION_NAMES);
  }

  function resolveRemission(value) {
    return resolveLookup(value, REMISSION_CODES, REMISSION_NAMES);
  }

  return {
    COUNTRY_CODES,
    TAX_BRANCH_CODES,
    STATE_CODES,
    EXEMPTION_CODES,
    REMISSION_CODES,
    resolveCountry,
    resolveTaxBranch,
    resolveState,
    resolveExemption,
    resolveRemission,
    normalizeLookupValue
  };
})();
