export function checkMembershipTaxSetup(registrations:any[],product:any):boolean {
 const collecting=registrations.some(reg=>reg.country==="GB"&&reg.status==="active");
 return collecting && product?.active===true &&
   typeof product?.tax_code==="string" && product.tax_code.length>4 &&
   product.tax_code!=="txcd_00000000";
}
