import * as aql from './aql';
// import db from './explorer';

export function vendorWithBrand() {
  let aqlStr = "SELECT Brand.Company, COUNTDISTINCT(Brand.Name) FROM amSoftLicCounter WHERE (bType = 0) AND (bLicUpgrade = 0) AND (dSoftInstallCount > 0 OR dLicUseRights > 0 OR dLicUseRightsUpg > 0) AND Brand.PK<>0 GROUP BY Brand.Company";

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
          v.nonCompliance = v.nonCompliance || 0;
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
          v.overCompliance = v.overCompliance || 0;
          if (v.name == vendor[0])
            v.overCompliance = Number(vendor[1]);
        });
      });

      return vendors;
    }
  });
}

export function productInVendor(vendorName) {
  let aqlStr = `SELECT Brand.Name, sum(dSoftInstallCount), sum(dLicUseRights), count(*) FROM amSoftLicCounter WHERE (bType = 0) AND (bLicUpgrade = 0) AND (dSoftInstallCount> 0 OR dLicUseRights > 0 OR dLicUseRightsUpg > 0)  AND Brand.PK<>0 AND Brand.Company.Name = '${vendorName}' GROUP BY Brand.Name`;

  return aql.queryAQL(aqlStr).then((aqlData) => {
    if (aqlData.rows) {
      let products = aqlData.rows.map((product) => {
        let summary = {
          name: product[0],
          license: Number(product[2]),
          consumption: Number(product[1]),
          versions: Number(product[3])
        };
        const balance = Number(product[2]) - Number(product[1]);
        if (balance >= 0)
          summary.surplus = balance;
        else
          summary.gap = Math.abs(balance);

        return summary;
      });

      return products;
    }
  });
}
