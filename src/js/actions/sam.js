import * as aql from './aql';
// import db from './explorer';

export function vendorWithBrand() {
  let aqlStr = "SELECT Brand.Company, COUNTDISTINCT(Brand.Name) FROM amSoftLicCounter WHERE (bType = 0) AND (bLicUpgrade = 0) AND (dSoftInstallCount > 0) AND Brand.PK<>0 GROUP BY Brand.Company";

  return aql.queryAQL(aqlStr).then((aqlData) => {
    if (aqlData.rows) {
      let vendors = aqlData.rows.map((vendor) => {
        return {
          name: vendor[0],
          products: Number(vendor[1])
        };
      });

      return vendorWithNonCompliance(vendors);
    }
  });
}

function vendorWithNonCompliance(vendors) {
  let aqlStr = "SELECT Brand.Company, COUNTDISTINCT(Brand.Name) FROM amSoftLicCounter WHERE (bType = 0) AND (bLicUpgrade = 0) AND (dCompliancyUpg < 0)  AND Brand.PK<>0 GROUP BY Brand.Company";

  return aql.queryAQL(aqlStr).then((aqlData) => {
    if (aqlData.rows) {
      aqlData.rows.forEach((vendor) => {
        vendors.forEach((v) => {
          if (v.name == vendor[0])
            v.nonCompliance = Number(vendor[1]);
        });
      });

      return vendorWithOverCompliance(vendors);
    }
  });
}

function vendorWithOverCompliance(vendors) {
  let aqlStr = "SELECT Brand.Company, COUNTDISTINCT(Brand.Name) FROM amSoftLicCounter WHERE (bType = 0) AND (bLicUpgrade = 0) AND (dCompliancyUpg > 0)  AND Brand.PK<>0 GROUP BY Brand.Company";

  return aql.queryAQL(aqlStr).then((aqlData) => {
    if (aqlData.rows) {
      aqlData.rows.forEach((vendor) => {
        vendors.forEach((v) => {
          if (v.name == vendor[0])
            v.overCompliance = Number(vendor[1]);
        });
      });

      return vendors;
    }
  });
}

export function productInVendor(vendorName) {
  let aqlStr = `SELECT Brand.Name, sum(dUnusedInstall), sum(dEntitled), count(*) FROM amSoftLicCounter WHERE (bType = 0) AND (bLicUpgrade = 0) AND (dSoftInstallCount> 0)  AND Brand.PK<>0 AND Brand.Company.Name = '${vendorName}' GROUP BY Brand.Name`;

  return aql.queryAQL(aqlStr).then((aqlData) => {
    if (aqlData.rows) {
      let products = aqlData.rows.map((product) => {
        let p = { name: product[0] };
        if (product[1])
          p.unused = Number(product[1]);
        if (product[2])
          p.entitled = Number(product[2]);
        if (product[3])
          p.versions = Number(product[3]);

        return p;
      });

      return products;
    }
  });
}
