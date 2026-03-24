import * as XLSX from 'xlsx';

export type CondType = 'none' | 'soft' | 'hard';
export type DecisionMode = 'balanced' | 'maximizeUpside' | 'minimizeRisk';
export type Region = 'Northeast' | 'South' | 'Midwest' | 'West' | 'National';

export interface SchoolData {
  name: string;
  grossY1: number;
  tuitionY1?: number;
  feesY1?: number;
  scholarship: number | string;
  guarantee: boolean;
  condType: CondType;
  condRate: number;
  curveMedian?: number;
  scholCondition?: number;
  curveStdDev?: number;
  rank: number;
  lsat: number;
  biglaw: number;
  fc?: number;
  barPass?: number;
  regionalPlacement?: number;
  region?: Region;
  state?: string;
  notes?: string;
  specialMode?: 'duqMode' | 'scholFixed' | 'uicMode';
  crossedOff?: boolean;
  attending?: boolean;
  withdrawn?: boolean;
  livingCostYearly?: number;
  borrowRate?: number;
  originationFee?: number;
}

export interface UserPreferences {
  targetRegion?: Region | 'Any';
  targetState?: string | 'Any';
  isDeadset: boolean;
}

export function normalCDF(x: number, mean: number, stdDev: number): number {
  const z = (x - mean) / stdDev;
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  if (z > 0) p = 1 - p;
  return p;
}

export const initialSchools: SchoolData[] = [
  {"name":"Stanford University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":1,"lsat":173,"biglaw":40,"fc":28,"livingCostYearly":28000,"region":"National","state":"CA"},
  {"name":"Yale University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":1,"lsat":174,"biglaw":31,"fc":35,"livingCostYearly":20000,"region":"National","state":"CT"},
  {"name":"University of Chicago","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":3,"lsat":174,"biglaw":49,"fc":25,"livingCostYearly":22000,"region":"National","state":"IL"},
  {"name":"University of Virginia","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":4,"lsat":173,"biglaw":60,"fc":15,"livingCostYearly":20000,"region":"National","state":"VA"},
  {"name":"University of Pennsylvania","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":5,"lsat":173,"biglaw":64,"fc":10,"livingCostYearly":22000,"region":"National","state":"PA"},
  {"name":"Harvard University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":6,"lsat":174,"biglaw":51,"fc":18,"livingCostYearly":20000,"region":"National","state":"MA"},
  {"name":"Duke University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":6,"lsat":171,"biglaw":68,"fc":8,"livingCostYearly":20000,"region":"National","state":"NC"},
  {"name":"New York University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":8,"lsat":172,"biglaw":54,"fc":6,"livingCostYearly":28000,"region":"National","state":"NY"},
  {"name":"University of Michigan","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":8,"lsat":171,"biglaw":50,"fc":8,"livingCostYearly":20000,"region":"National","state":"MI"},
  {"name":"Columbia University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":10,"lsat":173,"biglaw":65,"fc":5,"livingCostYearly":28000,"region":"National","state":"NY"},
  {"name":"Northwestern University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":10,"lsat":173,"biglaw":64,"fc":4,"livingCostYearly":20000,"region":"National","state":"IL"},
  {"name":"University of California—Los Angeles","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":12,"lsat":171,"biglaw":51,"fc":5,"livingCostYearly":28000,"region":"National","state":"CA"},
  {"name":"University of California—Berkeley","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":13,"lsat":170,"biglaw":52,"fc":6,"livingCostYearly":28000,"region":"National","state":"CA"},
  {"name":"Washington University in St. Louis","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":14,"lsat":175,"biglaw":39,"fc":7,"livingCostYearly":20000,"region":"Midwest","state":"MO"},
  {"name":"Georgetown University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":14,"lsat":171,"biglaw":55,"fc":4,"livingCostYearly":28000,"region":"National","state":"DC"},
  {"name":"Vanderbilt University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":14,"lsat":170,"biglaw":48,"fc":8,"livingCostYearly":20000,"region":"South","state":"TN"},
  {"name":"University of Texas at Austin","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":14,"lsat":172,"biglaw":42,"fc":6,"livingCostYearly":20000,"region":"South","state":"TX","regionalPlacement":9.5},
  {"name":"University of North Carolina","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":18,"lsat":168,"biglaw":25,"fc":5,"livingCostYearly":20000,"region":"South","state":"NC"},
  {"name":"Cornell University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":18,"lsat":173,"biglaw":72,"fc":3,"livingCostYearly":28000,"region":"National","state":"NY"},
  {"name":"University of Notre Dame","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":20,"lsat":170,"biglaw":40,"fc":12,"livingCostYearly":20000,"region":"Midwest","state":"IN"},
  {"name":"University of Minnesota","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":20,"lsat":171,"biglaw":16,"livingCostYearly":20000,"region":"Midwest","state":"MN"},
  {"name":"University of Georgia","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":22,"lsat":169,"biglaw":17,"livingCostYearly":20000,"region":"South","state":"GA"},
  {"name":"Texas A&M University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":22,"lsat":169,"biglaw":19,"livingCostYearly":20000,"region":"South","state":"TX","regionalPlacement":8.5},
  {"name":"Boston University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":22,"lsat":170,"biglaw":36,"livingCostYearly":28000,"region":"Northeast","state":"MA"},
  {"name":"Boston College","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":25,"lsat":168,"biglaw":44,"livingCostYearly":20000,"region":"Northeast","state":"MA"},
  {"name":"Wake Forest University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":26,"lsat":166,"biglaw":25,"livingCostYearly":20000,"region":"South","state":"NC"},
  {"name":"University of Southern California","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":26,"lsat":169,"biglaw":57,"livingCostYearly":28000,"region":"West","state":"CA"},
  {"name":"University of Wisconsin","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":28,"lsat":167,"biglaw":13,"livingCostYearly":20000,"region":"Midwest","state":"WI"},
  {"name":"Ohio State University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":28,"lsat":168,"biglaw":13,"livingCostYearly":20000,"region":"Midwest","state":"OH"},
  {"name":"Brigham Young University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":28,"lsat":170,"biglaw":23,"livingCostYearly":20000,"region":"West","state":"UT"},
  {"name":"George Washington University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":31,"lsat":168,"biglaw":30,"livingCostYearly":28000,"region":"South","state":"DC"},
  {"name":"University of Utah","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":31,"lsat":166,"biglaw":8,"livingCostYearly":20000,"region":"West","state":"UT"},
  {"name":"University of Alabama","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":31,"lsat":167,"biglaw":20,"livingCostYearly":20000,"region":"South","state":"AL"},
  {"name":"William & Mary Law School","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":31,"lsat":166,"biglaw":18,"livingCostYearly":20000,"region":"South","state":"VA"},
  {"name":"George Mason University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":31,"lsat":169,"biglaw":11,"livingCostYearly":20000,"region":"South","state":"VA"},
  {"name":"Washington and Lee University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":36,"lsat":167,"biglaw":21,"livingCostYearly":20000,"region":"South","state":"VA"},
  {"name":"University of Iowa","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":36,"lsat":164,"biglaw":16,"livingCostYearly":20000,"region":"Midwest","state":"IA"},
  {"name":"Florida State University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":38,"lsat":166,"biglaw":16,"livingCostYearly":20000,"region":"South","state":"FL"},
  {"name":"University of Florida (Levin)","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":38,"lsat":169,"biglaw":25,"livingCostYearly":20000,"region":"South","state":"FL"},
  {"name":"Fordham University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":38,"lsat":168,"biglaw":42,"livingCostYearly":28000,"region":"Northeast","state":"NY"},
  {"name":"University of California—Irvine","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":38,"lsat":169,"biglaw":29,"livingCostYearly":28000,"region":"West","state":"CA"},
  {"name":"Emory University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":38,"lsat":166,"biglaw":34,"livingCostYearly":20000,"region":"South","state":"GA"},
  {"name":"Baylor University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":43,"lsat":164,"biglaw":7,"livingCostYearly":20000,"region":"South","state":"TX","regionalPlacement":9.0},
  {"name":"Southern Methodist University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":43,"lsat":167,"biglaw":28,"livingCostYearly":20000,"region":"South","state":"TX","regionalPlacement":8.8},
  {"name":"Arizona State University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":45,"lsat":165,"biglaw":11,"livingCostYearly":20000,"region":"West","state":"AZ"},
  {"name":"University of Colorado—Boulder","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":46,"lsat":164,"biglaw":18,"livingCostYearly":20000,"region":"West","state":"CO"},
  {"name":"Indiana University - Bloomington","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":46,"lsat":164,"biglaw":17,"livingCostYearly":20000,"region":"Midwest","state":"IN"},
  {"name":"Villanova University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":48,"lsat":164,"biglaw":20,"livingCostYearly":20000,"region":"Northeast","state":"PA"},
  {"name":"University of Illinois—Urbana Champaign","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":48,"lsat":166,"biglaw":34,"livingCostYearly":20000,"region":"Midwest","state":"IL"},
  {"name":"University of Washington","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":50,"lsat":165,"biglaw":16,"livingCostYearly":22000,"region":"West","state":"WA"},
  {"name":"Temple University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":50,"lsat":165,"biglaw":18,"livingCostYearly":22000,"region":"Northeast","state":"PA"},
  {"name":"University of Kansas","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":50,"lsat":162,"biglaw":10,"livingCostYearly":20000,"region":"Midwest","state":"KS"},
  {"name":"University of California—Davis","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":50,"lsat":165,"biglaw":26,"livingCostYearly":28000,"region":"West","state":"CA"},
  {"name":"University of Connecticut","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":50,"lsat":162,"biglaw":11,"livingCostYearly":20000,"region":"Northeast","state":"CT"},
  {"name":"University of Tennessee","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":55,"lsat":164,"biglaw":10,"livingCostYearly":20000},
  {"name":"Pepperdine University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":55,"lsat":164,"biglaw":12,"livingCostYearly":28000},
  {"name":"University of San Diego","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":57,"lsat":163,"biglaw":13,"livingCostYearly":28000},
  {"name":"University of Missouri","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":57,"lsat":161,"biglaw":11,"livingCostYearly":20000},
  {"name":"University of Arizona","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":59,"lsat":163,"biglaw":8,"livingCostYearly":20000},
  {"name":"University of Oklahoma","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":59,"lsat":162,"biglaw":6,"livingCostYearly":20000},
  {"name":"Pennsylvania State - Dickinson Law","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":59,"lsat":159,"biglaw":8,"livingCostYearly":20000},
  {"name":"Marquette University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":59,"lsat":158,"biglaw":6,"livingCostYearly":20000},
  {"name":"Yeshiva University (Cardozo)","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":63,"lsat":165,"biglaw":19,"livingCostYearly":28000},
  {"name":"University of Houston","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":63,"lsat":163,"biglaw":22,"livingCostYearly":20000,"region":"South","state":"TX","regionalPlacement":8.2},
  {"name":"University of South Carolina","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":63,"lsat":162,"biglaw":8,"livingCostYearly":20000},
  {"name":"University of Maryland","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":63,"lsat":164,"biglaw":10,"livingCostYearly":20000},
  {"name":"St. John's University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":63,"lsat":164,"biglaw":16,"livingCostYearly":28000},
  {"name":"Northeastern University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":68,"lsat":164,"biglaw":20,"livingCostYearly":28000},
  {"name":"Pennsylvania State - Penn State Law","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":68,"lsat":150,"biglaw":0,"livingCostYearly":20000},
  {"name":"University of Kentucky","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":68,"lsat":159,"biglaw":6,"livingCostYearly":20000},
  {"name":"Catholic University Of America","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":71,"lsat":161,"biglaw":9,"livingCostYearly":28000},
  {"name":"Wayne State University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":71,"lsat":164,"biglaw":5,"livingCostYearly":20000},
  {"name":"Seton Hall University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":71,"lsat":161,"biglaw":11,"livingCostYearly":20000},
  {"name":"University of Cincinnati","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":71,"lsat":159,"biglaw":6,"livingCostYearly":20000},
  {"name":"Loyola Marymount University—Los Angeles","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":71,"lsat":163,"biglaw":17,"livingCostYearly":28000},
  {"name":"Tulane University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":71,"lsat":161,"biglaw":19,"livingCostYearly":20000},
  {"name":"University of Nebraska","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":71,"lsat":160,"biglaw":5,"livingCostYearly":20000},
  {"name":"University of Richmond","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":71,"lsat":164,"biglaw":12,"livingCostYearly":20000},
  {"name":"Drexel University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":79,"lsat":160,"biglaw":17,"livingCostYearly":22000},
  {"name":"Georgia State University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":79,"lsat":160,"biglaw":9,"livingCostYearly":20000},
  {"name":"University of Pittsburgh","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":79,"lsat":160,"biglaw":14,"livingCostYearly":20000},
  {"name":"University of Nevada—Las Vegas","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":79,"lsat":160,"biglaw":8,"livingCostYearly":20000},
  {"name":"Loyola University—Chicago","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":79,"lsat":161,"biglaw":16,"livingCostYearly":22000},
  {"name":"Belmont University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":84,"lsat":161,"biglaw":42,"livingCostYearly":20000},
  {"name":"Louisiana State University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":84,"lsat":157,"biglaw":2,"livingCostYearly":20000},
  {"name":"Drake University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":84,"lsat":156,"biglaw":7,"livingCostYearly":20000},
  {"name":"Florida International University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":84,"lsat":161,"biglaw":10,"livingCostYearly":20000},
  {"name":"Texas Tech University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":88,"lsat":159,"biglaw":8,"livingCostYearly":20000},
  {"name":"University of Denver","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":88,"lsat":160,"biglaw":9,"livingCostYearly":20000},
  {"name":"University of Maine","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":88,"lsat":158,"biglaw":1,"livingCostYearly":20000},
  {"name":"University of California (Hastings)","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":88,"lsat":150,"biglaw":0,"livingCostYearly":28000},
  {"name":"University of Miami","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":92,"lsat":164,"biglaw":20,"livingCostYearly":20000},
  {"name":"Duquesne University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":92,"lsat":157,"biglaw":7,"livingCostYearly":20000},
  {"name":"Saint Louis University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":94,"lsat":157,"biglaw":7,"livingCostYearly":20000},
  {"name":"University of St. Thomas (Minnesota)","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":94,"lsat":159,"biglaw":3,"livingCostYearly":20000},
  {"name":"Regent University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":94,"lsat":158,"biglaw":0,"livingCostYearly":20000},
  {"name":"University of Buffalo—SUNY","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":94,"lsat":157,"biglaw":3,"livingCostYearly":28000},
  {"name":"University of Oregon","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":94,"lsat":160,"biglaw":3,"livingCostYearly":20000},
  {"name":"University of Missouri—Kansas City","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":99,"lsat":156,"biglaw":10,"livingCostYearly":20000},
  {"name":"University of Montana","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":99,"lsat":156,"biglaw":3,"livingCostYearly":20000},
  {"name":"Lewis And Clark College","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":99,"lsat":161,"biglaw":3,"livingCostYearly":20000},
  {"name":"Stetson University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":99,"lsat":159,"biglaw":8,"livingCostYearly":20000},
  {"name":"University of Hawaii","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":99,"lsat":158,"biglaw":0,"livingCostYearly":20000},
  {"name":"American University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":104,"lsat":162,"biglaw":13,"livingCostYearly":28000},
  {"name":"Chapman University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":104,"lsat":163,"biglaw":6,"livingCostYearly":28000},
  {"name":"Rutgers State University Newark (old)","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":104,"lsat":150,"biglaw":0,"livingCostYearly":20000},
  {"name":"University of New Mexico","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":107,"lsat":157,"biglaw":0,"livingCostYearly":20000},
  {"name":"Syracuse University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":107,"lsat":158,"biglaw":5,"livingCostYearly":28000},
  {"name":"Indiana University - Indianapolis","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":107,"lsat":155,"biglaw":8,"livingCostYearly":20000},
  {"name":"Samford University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":107,"lsat":156,"biglaw":6,"livingCostYearly":20000},
  {"name":"University of Dayton","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":107,"lsat":157,"biglaw":7,"livingCostYearly":20000},
  {"name":"Illinois Institute of Technology (Kent)","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":107,"lsat":161,"biglaw":10,"livingCostYearly":22000},
  {"name":"Case Western Reserve University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":107,"lsat":162,"biglaw":13,"livingCostYearly":20000},
  {"name":"Mercer University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":107,"lsat":157,"biglaw":3,"livingCostYearly":20000},
  {"name":"University of Arkansas, Fayetteville","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":115,"lsat":158,"biglaw":4,"livingCostYearly":20000},
  {"name":"Michigan State University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":115,"lsat":162,"biglaw":4,"livingCostYearly":20000},
  {"name":"University of Wyoming","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":117,"lsat":156,"biglaw":1,"livingCostYearly":20000},
  {"name":"Albany Law School Of Union University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":117,"lsat":158,"biglaw":2,"livingCostYearly":28000},
  {"name":"West Virginia University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":117,"lsat":155,"biglaw":3,"livingCostYearly":20000},
  {"name":"Brooklyn Law School","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":117,"lsat":161,"biglaw":18,"livingCostYearly":28000},
  {"name":"New York Law School","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":121,"lsat":157,"biglaw":13,"livingCostYearly":28000},
  {"name":"Cleveland State University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":121,"lsat":155,"biglaw":7,"livingCostYearly":20000},
  {"name":"University of Mississippi","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":121,"lsat":157,"biglaw":6,"livingCostYearly":20000},
  {"name":"Washburn University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":121,"lsat":155,"biglaw":2,"livingCostYearly":20000},
  {"name":"Hofstra University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":125,"lsat":157,"biglaw":13,"livingCostYearly":28000},
  {"name":"University of New Hampshire","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":125,"lsat":155,"biglaw":5,"livingCostYearly":20000},
  {"name":"University of Akron","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":127,"lsat":154,"biglaw":3,"livingCostYearly":20000},
  {"name":"Seattle University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":127,"lsat":159,"biglaw":3,"livingCostYearly":22000},
  {"name":"University of Tulsa","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":127,"lsat":157,"biglaw":1,"livingCostYearly":20000},
  {"name":"University of South Dakota","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":127,"lsat":152,"biglaw":1,"livingCostYearly":20000},
  {"name":"Suffolk University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":127,"lsat":155,"biglaw":12,"livingCostYearly":28000},
  {"name":"Howard University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":127,"lsat":156,"biglaw":39,"livingCostYearly":28000},
  {"name":"DePaul University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":133,"lsat":158,"biglaw":8,"livingCostYearly":22000},
  {"name":"Campbell University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":134,"lsat":156,"biglaw":2,"livingCostYearly":20000},
  {"name":"Loyola University—New Orleans","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":134,"lsat":154,"biglaw":1,"livingCostYearly":20000},
  {"name":"Northern Kentucky University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":134,"lsat":154,"biglaw":6,"livingCostYearly":20000},
  {"name":"University of Detroit Mercy","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":134,"lsat":156,"biglaw":4,"livingCostYearly":20000},
  {"name":"South Texas College Of Law—Houston","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":138,"lsat":155,"biglaw":6,"livingCostYearly":20000},
  {"name":"University of Arkansas, Little Rock","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":139,"lsat":153,"biglaw":0,"livingCostYearly":20000},
  {"name":"University of Baltimore","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":139,"lsat":155,"biglaw":1,"livingCostYearly":20000},
  {"name":"Quinnipiac University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":141,"lsat":155,"biglaw":2,"livingCostYearly":20000},
  {"name":"Liberty University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":141,"lsat":154,"biglaw":2,"livingCostYearly":20000},
  {"name":"Pace University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":141,"lsat":154,"biglaw":6,"livingCostYearly":28000},
  {"name":"University of Idaho","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":141,"lsat":153,"biglaw":0,"livingCostYearly":20000},
  {"name":"Gonzaga University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":141,"lsat":155,"biglaw":2,"livingCostYearly":20000},
  {"name":"University of Memphis","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":146,"lsat":155,"biglaw":1,"livingCostYearly":20000},
  {"name":"University of Louisville","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":146,"lsat":157,"biglaw":3,"livingCostYearly":20000},
  {"name":"Creighton University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":148,"lsat":153,"biglaw":3,"livingCostYearly":20000},
  {"name":"St. Mary's University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":148,"lsat":153,"biglaw":0,"livingCostYearly":20000},
  {"name":"Willamette University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":150,"lsat":154,"biglaw":0,"livingCostYearly":20000},
  {"name":"Northern Illinois University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":150,"lsat":150,"biglaw":1,"livingCostYearly":20000},
  {"name":"University of Toledo","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":150,"lsat":153,"biglaw":0,"livingCostYearly":20000},
  {"name":"Ave Maria School Of Law","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":153,"lsat":155,"biglaw":2,"livingCostYearly":20000},
  {"name":"Southwestern Law School","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":154,"lsat":157,"biglaw":7,"livingCostYearly":28000},
  {"name":"Mitchell Hamline","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":154,"lsat":154,"biglaw":2,"livingCostYearly":20000},
  {"name":"CUNY","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":156,"lsat":155,"biglaw":2,"livingCostYearly":28000},
  {"name":"Santa Clara University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":156,"lsat":159,"biglaw":20,"livingCostYearly":28000},
  {"name":"Oklahoma City University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":158,"lsat":151,"biglaw":0,"livingCostYearly":20000},
  {"name":"Elon University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":158,"lsat":154,"biglaw":2,"livingCostYearly":20000},
  {"name":"Mississippi College","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":158,"lsat":152,"biglaw":2,"livingCostYearly":20000},
  {"name":"University of North Dakota","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":161,"lsat":151,"biglaw":0,"livingCostYearly":20000},
  {"name":"University of Massachusetts Dartmouth","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":161,"lsat":152,"biglaw":0,"livingCostYearly":20000},
  {"name":"University of North Texas at Dallas","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":163,"lsat":153,"biglaw":1,"livingCostYearly":20000},
  {"name":"University of the Pacific (Mcgeorge)","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":163,"lsat":156,"biglaw":5,"livingCostYearly":28000},
  {"name":"Vermont Law School","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":163,"lsat":152,"biglaw":1,"livingCostYearly":20000},
  {"name":"New England Law | Boston","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":166,"lsat":153,"biglaw":2,"livingCostYearly":28000},
  {"name":"Western New England University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":166,"lsat":153,"biglaw":0,"livingCostYearly":20000},
  {"name":"University of San Francisco","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":166,"lsat":155,"biglaw":13,"livingCostYearly":28000},
  {"name":"University of Illinois—Chicago","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":169,"lsat":153,"biglaw":6,"livingCostYearly":22000},
  {"name":"Touro College","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":169,"lsat":153,"biglaw":1,"livingCostYearly":28000},
  {"name":"Widener University—Delaware","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":169,"lsat":150,"biglaw":0,"livingCostYearly":20000},
  {"name":"Roger Williams University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":169,"lsat":150,"biglaw":1,"livingCostYearly":20000},
  {"name":"Lincoln Memorial","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":169,"lsat":153,"biglaw":2,"livingCostYearly":20000},
  {"name":"Capital University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":174,"lsat":151,"biglaw":2,"livingCostYearly":20000},
  {"name":"(Part-time) Widener University—Pennsylvania (Commonwealth)","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":175,"lsat":152,"biglaw":3,"livingCostYearly":20000},
  {"name":"University of Puerto Rico","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":175,"lsat":152,"biglaw":1,"livingCostYearly":20000},
  {"name":"Southern Illinois University—Carbondale","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":175,"lsat":149,"biglaw":1,"livingCostYearly":20000},
  {"name":"Nova Southeastern University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":178,"lsat":155,"biglaw":7,"livingCostYearly":20000},
  {"name":"St. Thomas University (Florida)","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":178,"lsat":152,"biglaw":6,"livingCostYearly":20000},
  {"name":"Inter American University School of Law","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":178,"lsat":144,"biglaw":0,"livingCostYearly":20000},
  {"name":"University of the District of Columbia","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":178,"lsat":151,"biglaw":2,"livingCostYearly":28000},
  {"name":"Appalachian School of Law","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":178,"lsat":146,"biglaw":0,"livingCostYearly":20000},
  {"name":"Florida A&M University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":178,"lsat":152,"biglaw":6,"livingCostYearly":20000},
  {"name":"Southern University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":178,"lsat":147,"biglaw":2,"livingCostYearly":20000},
  {"name":"Atlanta's John Marshall Law School","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":178,"lsat":152,"biglaw":0,"livingCostYearly":20000},
  {"name":"Texas Southern University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":178,"lsat":150,"biglaw":2,"livingCostYearly":20000},
  {"name":"California Western School Of Law","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":178,"lsat":155,"biglaw":1,"livingCostYearly":28000},
  {"name":"Ohio Northern University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":178,"lsat":149,"biglaw":0,"livingCostYearly":20000},
  {"name":"Pontifical Catholic University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":178,"lsat":139,"biglaw":0,"livingCostYearly":20000},
  {"name":"Barry University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":178,"lsat":150,"biglaw":5,"livingCostYearly":20000},
  {"name":"Charleston School Of Law","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":178,"lsat":154,"biglaw":4,"livingCostYearly":20000},
  {"name":"Jones School of Law","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":178,"lsat":150,"biglaw":0,"livingCostYearly":20000},
  {"name":"Western Michigan University (Cooley)","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":178,"lsat":147,"biglaw":2,"livingCostYearly":20000},
  {"name":"North Carolina Central University","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":178,"lsat":151,"biglaw":4,"livingCostYearly":20000},
  {"name":"Western State College Of Law","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":178,"lsat":152,"biglaw":0,"livingCostYearly":28000},
  {"name":"Jacksonville University College of Law (Provisional)","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":180,"lsat":150,"biglaw":0,"livingCostYearly":20000,"region":"South","state":"FL"},
  {"name":"Wilmington University School of Law (Provisional)","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":180,"lsat":150,"biglaw":0,"livingCostYearly":20000,"region":"Northeast","state":"DE"},
  {"name":"High Point University Kenneth F. Kahn School of Law (Provisional)","grossY1":60000,"scholarship":0,"guarantee":false,"condType":"none","condRate":0,"rank":180,"lsat":150,"biglaw":0,"livingCostYearly":20000,"region":"South","state":"NC"}
];

export interface CalculatedSchool extends SchoolData {
  y1Net: number;
  y2Net: number;
  y3Net: number;
  totalNet: number;
  totalCOA: number;
  
  expectedTotalCOA: number;
  downsideCOA: number;
  upsideCOA: number;
  
  monthlyPayment: number;
  
  pBigLawTop10: number;
  pBigLawMedian: number;
  pBigLawBottom50: number;

  prestige: number;
  costEff: number;
  steal: number;
  riskScore: number;
  floorScore: number;
  ceilingScore: number;
  regionalFit: number;
  stability: number;
  composite: number;
}

export function calculateData(
  schoolsInput: SchoolData[] = initialSchools,
  mode: DecisionMode = 'balanced',
  prefs: UserPreferences = { targetRegion: 'Any', isDeadset: false }
): CalculatedSchool[] {
  const calculated = schoolsInput.map((school) => {
    let upsideY1 = 0, upsideY2 = 0, upsideY3 = 0;
    let downsideY1 = 0, downsideY2 = 0, downsideY3 = 0;

    const scholVal = typeof school.scholarship === 'number' ? school.scholarship : (school.specialMode === 'scholFixed' ? 63126 : 0);

    if (school.specialMode === 'duqMode') {
      const fees = school.feesY1 || 0;
      upsideY1 = fees;
      upsideY2 = fees * 1.03;
      upsideY3 = upsideY2 * 1.03;
      
      downsideY1 = fees;
      downsideY2 = school.grossY1 * 1.03;
      downsideY3 = school.grossY1 * 1.03 * 1.03;
    } else if (school.specialMode === 'uicMode') {
      const fees = school.feesY1 || 0;
      upsideY1 = fees;
      upsideY2 = fees * 1.03;
      upsideY3 = upsideY2 * 1.03;
      
      downsideY1 = fees;
      downsideY2 = school.grossY1 * 1.03;
      downsideY3 = school.grossY1 * 1.03 * 1.03;
    } else if (school.specialMode === 'scholFixed') {
      const tuition = school.tuitionY1 || 0;
      const fees = school.feesY1 || 0;
      upsideY1 = (tuition + fees) - scholVal;
      const y2Tuition = tuition * 1.03;
      upsideY2 = (y2Tuition + fees) - scholVal;
      const y3Tuition = y2Tuition * 1.03;
      upsideY3 = (y3Tuition + fees) - scholVal;
      
      downsideY1 = upsideY1;
      downsideY2 = y2Tuition + fees;
      downsideY3 = y3Tuition + fees;
    } else {
      upsideY1 = school.grossY1 - scholVal;
      upsideY2 = school.grossY1 * 1.03 - scholVal;
      upsideY3 = school.grossY1 * 1.03 * 1.03 - scholVal;
      
      downsideY1 = upsideY1;
      downsideY2 = school.grossY1 * 1.03;
      downsideY3 = school.grossY1 * 1.03 * 1.03;
    }

    if (school.guarantee || school.condType === 'none') {
      downsideY2 = upsideY2;
      downsideY3 = upsideY3;
    }

    const living = (school.livingCostYearly || 20000) * 3;
    const upsideCOA = upsideY1 + upsideY2 + upsideY3 + living;
    const downsideCOA = downsideY1 + downsideY2 + downsideY3 + living;

    let condRate = school.condRate || 0;
    if (school.condType !== 'none' && school.curveMedian && school.scholCondition) {
      const stdDev = school.curveStdDev || 0.3;
      condRate = normalCDF(school.scholCondition, school.curveMedian, stdDev);
    }

    const retentionRate = 1 - condRate;
    const expectedTotalCOA = (retentionRate * upsideCOA) + (condRate * downsideCOA);

    const borrowRate = school.borrowRate || 0.0805;
    const originationFee = school.originationFee || 0.04228;
    const principal = expectedTotalCOA / (1 - originationFee);
    const monthlyRate = borrowRate / 12;
    const numPayments = 120;
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);

    const blfc = school.biglaw + (school.fc || 0);
    const pBigLawTop10 = Math.min(100, blfc * 2.2 + 15);
    const pBigLawMedian = Math.max(0, Math.min(100, blfc * 1.2 - 5));
    const pBigLawBottom50 = Math.max(0, Math.min(100, blfc * 0.5 - 5));

    return {
      ...school,
      y1Net: upsideY1,
      y2Net: upsideY2,
      y3Net: upsideY3,
      totalNet: upsideY1 + upsideY2 + upsideY3,
      totalCOA: upsideCOA,
      expectedTotalCOA,
      downsideCOA,
      upsideCOA,
      monthlyPayment,
      pBigLawTop10,
      pBigLawMedian,
      pBigLawBottom50,
      prestige: 0,
      costEff: 0,
      steal: 0,
      riskScore: 0,
      floorScore: 0,
      ceilingScore: 0,
      stability: 0,
      composite: 0,
    };
  });

  const minExpected = Math.min(...calculated.map((s) => s.expectedTotalCOA));
  const maxExpected = Math.max(...calculated.map((s) => s.expectedTotalCOA));
  const minDownside = Math.min(...calculated.map((s) => s.downsideCOA));
  const maxDownside = Math.max(...calculated.map((s) => s.downsideCOA));
  const minUpside = Math.min(...calculated.map((s) => s.upsideCOA));
  const maxUpside = Math.max(...calculated.map((s) => s.upsideCOA));

  const LSAT_BEST = Math.max(...calculated.map(s => s.lsat));
  const LSAT_WORST = Math.min(...calculated.map(s => s.lsat));
  const BIGLAW_BEST = Math.max(...calculated.map(s => s.biglaw));
  const BIGLAW_WORST = Math.min(...calculated.map(s => s.biglaw));

  const rawValues = calculated.map(school => {
    let rankScore = 0;
    if (school.rank <= 3) rankScore = 10;
    else if (school.rank <= 6) rankScore = 9.5;
    else if (school.rank <= 14) rankScore = 9.0;
    else if (school.rank <= 20) rankScore = 8.0;
    else if (school.rank <= 30) rankScore = 7.5;
    else if (school.rank <= 40) rankScore = 6.5;
    else if (school.rank <= 50) rankScore = 5.5;
    else if (school.rank <= 75) rankScore = 4.5;
    else if (school.rank <= 100) rankScore = 3.5;
    else rankScore = Math.max(0, 2 - (school.rank / 100));

    const lsatNorm = ((school.lsat - LSAT_WORST) / (LSAT_BEST - LSAT_WORST)) * 10;
    const biglawNorm = ((school.biglaw - BIGLAW_WORST) / (BIGLAW_BEST - BIGLAW_WORST)) * 10;
    
    const outcomes = 0.6 * biglawNorm + 0.3 * rankScore + 0.1 * lsatNorm;
    
    const costFactor = Math.max(school.expectedTotalCOA, 50000) / 100000;
    const prestigeBonus = school.rank <= 14 ? 1.5 : 1.0;
    const rawValue = (outcomes * 10 * prestigeBonus) / Math.pow(costFactor, 0.7);
    
    return { outcomes, rawValue, rankScore };
  });

  const maxRawValue = Math.max(...rawValues.map(v => v.rawValue));
  const minRawValue = Math.min(...rawValues.map(v => v.rawValue));

  return calculated.map((school, i) => {
    const { outcomes, rankScore } = rawValues[i];
    
    const costScore = (maxExpected - minExpected) !== 0 ? ((maxExpected - school.expectedTotalCOA) / (maxExpected - minExpected)) * 10 : 5;
    const valueScore = (maxRawValue - minRawValue) !== 0 ? ((rawValues[i].rawValue - minRawValue) / (maxRawValue - minRawValue)) * 10 : 5;

    let riskScore = 10;
    if (school.guarantee) {
      riskScore = 10;
    } else if (school.condType === 'none') {
      riskScore = 9.5;
    } else if (school.condType === 'soft') {
      riskScore = 8.0;
    } else if (school.condType === 'hard') {
      riskScore = Math.max(0, (1 - (school.condRate * 1.2)) * 10);
    }

    const downsideProtectScore = ((maxDownside - school.downsideCOA) / (maxDownside - minDownside)) * 10;
    const upsideCostScore = ((maxUpside - school.upsideCOA) / (maxUpside - minUpside)) * 10;

    const barPassNorm = ((school.barPass || 85) - 60) / (100 - 60) * 10;
    const regionalNorm = ((school.regionalPlacement || 7) - 1) / (10 - 1) * 10;
    const floorScore = Math.max(0, Math.min(10, 0.4 * downsideProtectScore + 0.3 * barPassNorm + 0.3 * regionalNorm));

    const top10Norm = school.pBigLawTop10 / 100 * 10;
    const ceilingScore = Math.max(0, Math.min(10, 0.5 * top10Norm + 0.3 * upsideCostScore + 0.2 * rankScore));

    // Regional Fit Score calculation (0-10)
    let regionalFit = 5; // Neutral
    if (prefs.targetState && prefs.targetState !== 'Any') {
      if (school.state === prefs.targetState) {
        regionalFit = 8.5 + ((school.regionalPlacement || 7) / 10) * 1.5; // High fit
      } else if (school.region === 'National') {
        regionalFit = 7.5; // Good fit
      } else if (school.region === prefs.targetRegion) {
        regionalFit = 6; // Moderate fit
      } else {
        regionalFit = 3; // Poor fit
      }
    } else if (prefs.targetRegion && prefs.targetRegion !== 'Any') {
      if (school.region === prefs.targetRegion) {
        regionalFit = 8 + ((school.regionalPlacement || 7) / 10) * 2;
      } else if (school.region === 'National') {
        regionalFit = 7;
      } else {
        regionalFit = 4;
      }
    }

    // Regional Credence Logic
    let regionalBoost = 1.0;
    
    // Region-based boost
    if (prefs.targetRegion && prefs.targetRegion !== 'Any') {
      if (school.region === prefs.targetRegion) {
        regionalBoost *= prefs.isDeadset ? 1.4 : 1.15;
      } else if (school.region === 'National') {
        regionalBoost *= prefs.isDeadset ? 1.1 : 1.25;
      } else {
        regionalBoost *= prefs.isDeadset ? 0.6 : 0.9;
      }
    }

    // State-based boost (more specific)
    if (prefs.targetState && prefs.targetState !== 'Any') {
      if (school.state === prefs.targetState) {
        const placementFactor = (school.regionalPlacement || 7) / 7;
        regionalBoost *= prefs.isDeadset ? (1.5 * placementFactor) : (1.25 * placementFactor);
      } else if (school.region !== 'National') {
        // Penalty for non-national schools in the wrong state
        regionalBoost *= prefs.isDeadset ? 0.5 : 0.8;
      } else {
        // National schools are slightly less preferred than local but still good
        regionalBoost *= prefs.isDeadset ? 0.8 : 0.95;
      }
    }

    let composite = 0;
    const isElite = school.rank <= 14 || school.region === 'National';
    const outcomeWeight = isElite ? 0.5 : 0.3;
    const costWeight = isElite ? 0.05 : 0.2;
    const valueWeight = isElite ? 0.05 : 0.15;
    const floorWeight = 0.2;
    const ceilingWeight = isElite ? 0.2 : 0.15;

    if (mode === 'maximizeUpside') {
      composite = 0.5 * ceilingScore + 0.4 * outcomes + 0.1 * valueScore;
    } else if (mode === 'minimizeRisk') {
      composite = 0.4 * floorScore + 0.4 * costScore + 0.2 * riskScore;
    } else {
      composite = (outcomeWeight * outcomes + floorWeight * floorScore + ceilingWeight * ceilingScore + costWeight * costScore + valueWeight * valueScore) * regionalBoost;
    }

    if (school.withdrawn || school.crossedOff) {
      composite = -1;
    }

    return {
      ...school,
      prestige: outcomes,
      costEff: costScore,
      steal: valueScore,
      riskScore,
      floorScore,
      ceilingScore,
      regionalFit,
      stability: riskScore,
      composite
    };
  });
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDecimal(value: number) {
  return value.toFixed(1);
}

export function downloadToCSV(data: CalculatedSchool[]) {
  const headers = [
    'School Name',
    'Rank',
    'LSAT Median',
    'BigLaw %',
    'Gross Y1 Tuition',
    'Scholarship (Annual)',
    'Living Cost (Annual)',
    'Retention Rate (0-1)',
    'Total COA (Expected)',
    'Monthly Payment (10yr)',
    'Prestige Score',
    'Cost Efficiency',
    'Best Deal Score'
  ];

  const rows = data.map(s => {
    const scholVal = typeof s.scholarship === 'number' ? s.scholarship : 0;
    const retention = 1 - (s.condRate || 0);
    return [
      s.name,
      s.rank,
      s.lsat,
      s.biglaw,
      s.grossY1,
      scholVal,
      s.livingCostYearly || 20000,
      retention,
      s.expectedTotalCOA,
      s.monthlyPayment,
      s.prestige,
      s.costEff,
      s.composite
    ];
  });

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'Law_School_ROI_Matrix.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadToExcel(data: CalculatedSchool[]) {
  const headers = [
    'School Name',
    'Rank',
    'LSAT Median',
    'BigLaw %',
    'Gross Y1 Tuition',
    'Scholarship (Annual)',
    'Living Cost (Annual)',
    'Retention Rate (0-1)',
    'Total COA (Expected)',
    'Monthly Payment (10yr)',
    'Prestige Score',
    'Cost Efficiency',
    'Best Deal Score'
  ];

  const rows = data.map((s, i) => {
    const rowNum = i + 2;
    const scholVal = typeof s.scholarship === 'number' ? s.scholarship : 0;
    const retention = 1 - (s.condRate || 0);

    return [
      s.name,
      s.rank,
      s.lsat,
      s.biglaw,
      s.grossY1,
      scholVal,
      s.livingCostYearly || 20000,
      retention,
      { f: `(E${rowNum} + E${rowNum}*1.03 + E${rowNum}*1.03*1.03) - F${rowNum} - (H${rowNum} * 2 * F${rowNum}) + (G${rowNum} * 3)` },
      { f: `PMT(0.0805/12, 120, -I${rowNum}/0.95772)` },
      { f: `(0.5 * ((D${rowNum} - MIN(D$2:D$100))/(MAX(D$2:D$100) - MIN(D$2:D$100)))*10) + (0.3 * ((MAX(B$2:B$100) - B${rowNum})/(MAX(B$2:B$100) - MIN(B$2:B$100)))*10) + (0.2 * ((C${rowNum} - MIN(C$2:C$100))/(MAX(C$2:C$100) - MIN(C$2:C$100)))*10)` },
      { f: `((MAX(I$2:I$100) - I${rowNum}) / (MAX(I$2:I$100) - MIN(I$2:I$100))) * 10` },
      { f: `0.4 * K${rowNum} + 0.4 * L${rowNum} + 0.2 * ((K${rowNum} + L${rowNum})/2)` } // Simplified composite
    ];
  });

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 30 }, // Name
    { wch: 8 },  // Rank
    { wch: 12 }, // LSAT
    { wch: 12 }, // BigLaw
    { wch: 15 }, // Tuition
    { wch: 18 }, // Scholarship
    { wch: 18 }, // Living
    { wch: 18 }, // Retention
    { wch: 20 }, // COA
    { wch: 20 }, // Payment
    { wch: 15 }, // Prestige
    { wch: 15 }, // Cost Eff
    { wch: 15 }  // Best Deal
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Law School Matrix');

  // Add Instructions Sheet
  const instructions = [
    ['lawschool.fit - ROI Matrix Instructions'],
    [''],
    ['Column', 'Description', 'Notes'],
    ['School Name', 'Name of the institution', 'Input'],
    ['Rank', 'US News Rank', 'Input (Lower is better)'],
    ['LSAT Median', 'Median LSAT of the school', 'Input (Higher is better)'],
    ['BigLaw %', 'Percentage of graduates in BigLaw/FC', 'Input (Higher is better)'],
    ['Gross Y1 Tuition', 'Sticker price tuition for Year 1', 'Input'],
    ['Scholarship (Annual)', 'Annual scholarship amount', 'Input'],
    ['Living Cost (Annual)', 'Estimated yearly living expenses', 'Input'],
    ['Retention Rate (0-1)', 'Probability of keeping scholarship (1.0 = guaranteed)', 'Input'],
    ['Total COA (Expected)', 'Calculated total cost of attendance over 3 years', 'Formula (Auto-updates)'],
    ['Monthly Payment (10yr)', 'Estimated monthly loan payment after graduation', 'Formula (Auto-updates)'],
    ['Prestige Score', 'Normalized score based on Rank, LSAT, and BigLaw', 'Formula (Auto-updates)'],
    ['Cost Efficiency', 'Normalized score based on Total COA', 'Formula (Auto-updates)'],
    ['Best Deal Score', 'Composite score finding the best ROI', 'Formula (Auto-updates)'],
    [''],
    ['Note: Formulas are pre-programmed. You can change any "Input" value to see the scores update in real-time.']
  ];
  const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
  wsInstructions['!cols'] = [{ wch: 25 }, { wch: 50 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(workbook, wsInstructions, 'Instructions');

  XLSX.writeFile(workbook, 'Law_School_ROI_Matrix.xlsx');
}
