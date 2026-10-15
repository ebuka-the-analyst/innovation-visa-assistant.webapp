/**
 * Google can supply a structured name or a displayName only.
 * Respect the provider's spelling and keep any existing profile name if
 * Google omits fields on a later sign-in. Never derive a person's name
 * from their email address or split an unstructured name heuristically.
 */
type GoogleProfileName={name?:{givenName?:string|null;familyName?:string|null}|null;displayName?:string|null};
const clean=(value:unknown):string=>typeof value==="string"
 ?value.trim().replace(/\s+/g," ").slice(0,150):"";

export function namesFromGoogleProfile(
 profile:GoogleProfileName,
 existing?:{firstName?:string|null;lastName?:string|null}|null,
):{firstName:string;lastName:string}{
 const first=clean(profile.name?.givenName);
 const last=clean(profile.name?.familyName);
 const full=clean(profile.displayName);
 const previousFirst=clean(existing?.firstName);
 const previousLast=clean(existing?.lastName);
 // If Google supplies only its full display name, keep it intact as one
 // value for presentation; do not assume naming conventions.
 return {
  firstName:first||previousFirst||(last?"":full),
  lastName:last||previousLast,
 };
}

export function displayCustomerName(value:{
 firstName?:string|null;lastName?:string|null;
}):string{
 return [clean(value.firstName),clean(value.lastName)].filter(Boolean).join(" ")||"Name not provided";
}
