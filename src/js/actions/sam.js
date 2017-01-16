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
  let aqlStr = "SELECT Brand.Company, COUNTDISTINCT(Brand.Name) FROM amSoftLicCounter WHERE (bType = 0) AND (bLicUpgrade = 0) AND (dCompliancyUpg > 0) AND NOT EXISTS (SELECT 1 FROM amSoftLicCounter C7 WHERE C7.dCompliancyUpg < 0 AND C7.lBrandId <> 0 AND C7.lBrandId = amSoftLicCounter.lBrandId) AND Brand.PK<>0 GROUP BY Brand.Company";

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
  // let aqlStr = `SELECT Brand.Name, sum(dSoftInstallCount), sum(dLicUseRights), count(*) FROM amSoftLicCounter WHERE (bType = 0) AND (bLicUpgrade = 0) AND (dSoftInstallCount> 0 OR dLicUseRights > 0 OR dLicUseRightsUpg > 0)  AND Brand.PK<>0 AND Brand.Company.Name = '${vendorName}' GROUP BY Brand.Name`;
  let aqlStr =`
    SELECT amBrand.Name,
    (SELECT COUNT(1) FROM amSoftLicCounter C9 WHERE C9.lBrandId=amBrand.lBrandId AND C9.bType = 0 AND C9.bLicUpgrade = 0 AND C9.dCompliancyUpg < 0) O3,
    (SELECT COUNT(1) FROM amSoftLicCounter C8 WHERE C8.lBrandId=amBrand.lBrandId AND C8.bType = 0 AND C8.bLicUpgrade = 0 AND C8.dCompliancyUpg > 0) O2,
    (SELECT COUNT(1) FROM amSoftLicCounter C7 WHERE C7.lBrandId=amBrand.lBrandId AND C7.bType = 0 AND C7.bLicUpgrade = 0 AND (C7.dSoftInstallCount> 0 OR C7.dLicUseRights > 0 OR C7.dLicUseRightsUpg > 0)) O1
    FROM amBrand WHERE
    EXISTS (SELECT 1 FROM amSoftLicCounter C5 WHERE C5.lBrandId = amBrand.lBrandId AND (C5.dSoftInstallCount> 0 OR C5.dLicUseRights > 0 OR C5.dLicUseRightsUpg > 0))
    AND amBrand.Company.Name = '${vendorName}'
    ORDER BY O3 DESC
  `;

  return aql.queryAQL(aqlStr).then((aqlData) => {
    if (aqlData.rows) {
      let products = aqlData.rows.map((product) => {
        return {
          name: product[0],
          nonCompliance: Number(product[1]),
          overCompliance: Number(product[2]),
          versions: Number(product[3])
        };;
      });

      return products;
    }
  });
}
