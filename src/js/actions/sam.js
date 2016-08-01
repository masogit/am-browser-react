import * as aql from './aql';
// import db from './explorer';

export function vendorWithBrand(callback) {
  let aqlVendorWithBrand = "SELECT Brand.Company, COUNTDISTINCT(Brand.Name) FROM amSoftLicCounter WHERE (bType = 0) AND (bLicUpgrade = 0) AND Brand.PK<>0 GROUP BY Brand.Company";

  aql.queryAQL(aqlVendorWithBrand, (aqlData) => {
    if (aqlData.rows) {
      let vendors = aqlData.rows.map((vendor) => {
        return {
          name: vendor[0],
          products: vendor[1]
        };
      });

      vendorWithNonCompliance(vendors, callback);
    }
  });
}

export function vendorWithNonCompliance(vendors, callback) {
  let aqlVendorWithNonCompliance = "SELECT Brand.Company, COUNTDISTINCT(Brand.Name) FROM amSoftLicCounter WHERE (bType = 0) AND (bLicUpgrade = 0) AND (dCompliancyUpg < 0)  AND Brand.PK<>0 GROUP BY Brand.Company";

  aql.queryAQL(aqlVendorWithNonCompliance, (aqlData) => {
    if (aqlData.rows) {
      aqlData.rows.forEach((vendor) => {
        for (let v of vendors) {
          if (v.name == vendor[0])
            v.nonCompliance = vendor[1];
        }
      });

      vendorWithOverCompliance(vendors, callback);
    }
  });
}

export function vendorWithOverCompliance(vendors, callback) {
  let aqlVendorWithNonCompliance = "SELECT Brand.Company, COUNTDISTINCT(Brand.Name) FROM amSoftLicCounter WHERE (bType = 0) AND (bLicUpgrade = 0) AND (dCompliancyUpg > 0)  AND Brand.PK<>0 GROUP BY Brand.Company";

  aql.queryAQL(aqlVendorWithNonCompliance, (aqlData) => {
    if (aqlData.rows) {
      aqlData.rows.forEach((vendor) => {
        for (let v of vendors) {
          if (v.name == vendor[0])
            v.overCompliance = vendor[1];
        }
      });

      callback(vendors);
    }
  });
}
