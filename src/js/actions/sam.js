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

      callback(vendors);
    }
  });
}
