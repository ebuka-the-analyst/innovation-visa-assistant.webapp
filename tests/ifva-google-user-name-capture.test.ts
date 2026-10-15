import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";
import {namesFromGoogleProfile,displayCustomerName} from "../server/googleProfileNames";

const read=(p:string)=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("Google structured names are captured without modifying spelling",()=>{
 assert.deepEqual(namesFromGoogleProfile({
  name:{givenName:" Amara ",familyName:" Okafor "},displayName:"Amara Okafor",
 }),{firstName:"Amara",lastName:"Okafor"});
 assert.equal(displayCustomerName({firstName:"Amara",lastName:"Okafor"}),"Amara Okafor");
});
test("A Google displayName is retained in full if the provider lacks name fields",()=>{
 assert.deepEqual(namesFromGoogleProfile({displayName:"Dr Ada Nwosu"}),{
  firstName:"Dr Ada Nwosu",lastName:"",
 });
 assert.equal(displayCustomerName({firstName:"Dr Ada Nwosu",lastName:""}),"Dr Ada Nwosu");
});
test("Google partial profile never wipes a previously saved first or last name",()=>{
 assert.deepEqual(namesFromGoogleProfile({},{
  firstName:"Amina",lastName:"Usman",
 }),{firstName:"Amina",lastName:"Usman"});
 assert.deepEqual(namesFromGoogleProfile({name:{givenName:"Amina"}},{
  firstName:"Amina",lastName:"Usman",
 }),{firstName:"Amina",lastName:"Usman"});
 assert.equal(displayCustomerName({firstName:" ",lastName:"Usman"}),"Usman");
 assert.equal(displayCustomerName({firstName:" ",lastName:" "}),"Name not provided");
});
test("Names are not invented from email and missing names remain explicit",()=>{
 assert.deepEqual(namesFromGoogleProfile({displayName:""}),{
  firstName:"",lastName:"",
 });
 assert.equal(displayCustomerName({}),"Name not provided");
});
test("Google authentication records structured or full names on linked and new accounts",()=>{
 const auth=read("server/auth.ts");
 assert.match(auth,/scope: \["profile", "email"\]/);
 assert.match(auth,/const googleNames=namesFromGoogleProfile\(profile,existingUser\)/);
 assert.match(auth,/const googleNames=namesFromGoogleProfile\(profile\)/);
 assert.match(auth,/firstName: googleNames\.firstName/);
 assert.match(auth,/lastName: googleNames\.lastName/);
 const storage=read("server/storage.ts");
 assert.match(storage,/firstName: userData\.firstName\?\.trim\(\) \|\| existingByGoogleId\[0\]\.firstName/);
 assert.match(storage,/firstName: userData\.firstName\?\.trim\(\) \|\| existingByEmail\[0\]\.firstName/);
});
test("New email accounts require a name in browser and server",()=>{
 const auth=read("server/auth.ts");
 const signup=read("client/src/pages/signup.tsx");
 assert.match(auth,/typeof firstName !== "string" \|\| !firstName\.trim\(\)/);
 assert.match(auth,/typeof lastName !== "string" \|\| !lastName\.trim\(\)/);
 assert.match(signup,/autoComplete="given-name"/);
 assert.match(signup,/autoComplete="family-name"/);
 assert.match(signup,/data-testid="input-first-name"[\s\S]{0,85}required/);
 assert.match(signup,/data-testid="input-last-name"[\s\S]{0,85}required/);
});
test("Admin user table shows available first or last name instead of a dash",()=>{
 const admin=read("client/src/pages/admin-dashboard.tsx");
 assert.ok(admin.includes('user.firstName?.trim(), user.lastName?.trim()'));
 assert.ok(admin.includes('Name missing · Add name'));
 assert.doesNotMatch(admin,/user\.firstName && user\.lastName \? \x60\$\{user\.firstName\}/);
});

test("Name validation lives in registration only and never breaks existing password sign-ins",()=>{
 const auth=read("server/auth.ts");
 const loginStart=auth.indexOf("new LocalStrategy(");
 const registerStart=auth.indexOf('app.post("/api/auth/register"');
 assert.ok(loginStart>=0&&registerStart>loginStart);
 const loginBlock=auth.slice(loginStart,registerStart);
 const registerBlock=auth.slice(registerStart,auth.indexOf('app.post("/api/auth/login"',registerStart));
 assert.doesNotMatch(loginBlock,/typeof firstName/);
 assert.doesNotMatch(loginBlock,/typeof lastName/);
 assert.doesNotMatch(loginBlock,/res\.status\(400\).*name/);
 assert.match(loginBlock,/passport\.use/);
 assert.match(registerBlock,/typeof firstName !== "string"/);
 assert.match(registerBlock,/typeof lastName !== "string"/);
 assert.match(registerBlock,/150/);
 assert.match(registerBlock,/Please enter your first name and last name/);
 const requiredIndex=registerBlock.indexOf("Please enter your first name and last name");
 const createIndex=registerBlock.indexOf("storage.createUser(");
 assert.ok(requiredIndex>0&&createIndex>requiredIndex);
});
test("Google sign-in keeps name from structured profile or display name and admin supports missing legacy names",()=>{
 const auth=read("server/auth.ts");
 const source=read("server/googleProfileNames.ts");
 const admin=read("client/src/pages/admin-dashboard.tsx");
 assert.match(auth,/const googleNames=namesFromGoogleProfile\(profile,existingUser\)/);
 assert.match(auth,/const googleNames=namesFromGoogleProfile\(profile\)/);
 assert.match(source,/profile\.name\?\.givenName/);
 assert.match(source,/profile\.name\?\.familyName/);
 assert.match(source,/profile\.displayName/);
 assert.match(admin,/Name missing · Add name/);
 assert.match(admin,/setEditingUser\(user\)/);
 assert.match(admin,/data-testid=\{\x60button-add-user-name-\$\{user\.id\}\x60\}/);
 assert.match(admin,/\[viewingUserDetails\.firstName\?\.trim\(\), viewingUserDetails\.lastName\?\.trim\(\)\]/);
});
