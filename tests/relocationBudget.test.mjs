import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateRelocationBudget} from '../src/utils/relocationBudget.mjs';
test('correct monthly spending, moving target, buffer and gap',()=>{
 const value=calculateRelocationBudget({income:4000,rent:1200,utilities:150,groceries:500,transport:100,other:50,deposit:2500,moving:1800,savings:3500,months:3});
 assert.deepEqual(value,{monthlyExpenses:2000,monthlyBalance:2000,upfront:4300,emergency:6000,totalTarget:10300,savingsGap:6800,months:3});
});
test('handles negative and nonnumeric input without negative expenses',()=>{
 const value=calculateRelocationBudget({income:'abc',rent:-4,utilities:'',groceries:40,transport:null,other:0,deposit:-99,moving:'NaN',savings:1000,months:-8});
 assert.equal(value.monthlyExpenses,40);
 assert.equal(value.upfront,0);
 assert.equal(value.emergency,0);
 assert.equal(value.savingsGap,0);
 assert.equal(value.monthlyBalance,-40);
});
test('caps excessive reserve months and does not invent costs',()=>{
 const value=calculateRelocationBudget({income:0,rent:200,months:200});
 assert.equal(value.months,24);
 assert.equal(value.emergency,4800);
 assert.equal(value.totalTarget,4800);
});
