import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calculator, Download, Play, RefreshCw } from 'lucide-react';

export default function CNCRateCalculator() {
  const [material, setMaterial] = useState('MS');
  const [thickness, setThickness] = useState(16);
  const [perimeter, setPerimeter] = useState(2500); // mm
  const [holes, setHoles] = useState(4);
  const [method, setMethod] = useState('Plasma'); // Plasma, Oxyfuel, Laser
  const [margin, setMargin] = useState(20); // %

  const [results, setResults] = useState<any>(null);

  const calculateCost = () => {
    // Basic industrial logic for steel plate CNC cutting:
    // Oxyfuel is cheaper for thicker plates but slower. Plasma is medium. Laser is fast but expensive/limited thickness.
    let speedFactor = 1.0;
    let ratePerMm = 0.05; // Base cutting rate per mm per mm of thickness
    
    if (method === 'Plasma') {
      ratePerMm = 0.06;
      speedFactor = 1.2;
    } else if (method === 'Laser') {
      ratePerMm = 0.12;
      speedFactor = 2.5;
    } else {
      // Oxyfuel
      ratePerMm = 0.03;
      speedFactor = 0.6;
    }

    // Material weight calculation (density of steel is 7.85 g/cm3 -> 0.00000785 kg/mm3)
    // Assume a square bounding box for weight based on perimeter (approximate rectangle)
    const side = perimeter / 4;
    const volume = side * side * thickness;
    const weight = volume * 0.00000785; // kg
    
    let materialRate = 65; // Rs per kg
    if (material === 'SS304') materialRate = 220;
    if (material === 'Hardox') materialRate = 180;

    const materialCost = weight * materialRate;
    
    // Cutting Cost: length * rate * thickness multiplier
    const cuttingCost = perimeter * ratePerMm * (thickness / 10);
    const piercingCost = holes * (thickness * 1.5); // Rs per hole pierce based on thickness

    const totalBaseCost = materialCost + cuttingCost + piercingCost;
    const marginAmount = totalBaseCost * (margin / 100);
    const quotedAmount = totalBaseCost + marginAmount;

    setResults({
      weight: parseFloat(weight.toFixed(2)),
      materialCost: parseFloat(materialCost.toFixed(2)),
      cuttingCost: parseFloat(cuttingCost.toFixed(2)),
      piercingCost: parseFloat(piercingCost.toFixed(2)),
      totalBaseCost: parseFloat(totalBaseCost.toFixed(2)),
      quotedAmount: parseFloat(quotedAmount.toFixed(2)),
      estTime: Math.ceil((perimeter / (speedFactor * 1000)) + (holes * 0.2)) // mins
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">CNC Rate Calculator</h2>
        <p className="text-muted-foreground">Technical pricing matrix for laser, plasma, and oxy-fuel cutting.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Inputs */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Configurator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Material Grade</label>
              <select 
                value={material} 
                onChange={e => setMaterial(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="MS">Mild Steel (IS 2062)</option>
                <option value="SS304">Stainless Steel 304</option>
                <option value="SS316">Stainless Steel 316</option>
                <option value="Hardox">Hardox 400</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Plate Thickness (mm)</label>
              <Input 
                type="number" 
                value={thickness} 
                onChange={e => setThickness(Number(e.target.value))} 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cutting Perimeter (mm)</label>
              <Input 
                type="number" 
                value={perimeter} 
                onChange={e => setPerimeter(Number(e.target.value))} 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Holes (Pierces)</label>
              <Input 
                type="number" 
                value={holes} 
                onChange={e => setHoles(Number(e.target.value))} 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cutting Method</label>
              <select 
                value={method} 
                onChange={e => setMethod(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="Plasma">CNC Plasma</option>
                <option value="Oxyfuel">CNC Oxy-Fuel</option>
                <option value="Laser">Fiber Laser</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Commercial Margin (%)</label>
              <Input 
                type="number" 
                value={margin} 
                onChange={e => setMargin(Number(e.target.value))} 
              />
            </div>

            <Button onClick={calculateCost} className="w-full mt-4">
              <Calculator className="h-4 w-4 mr-2" /> Calculate Rates
            </Button>
          </CardContent>
        </Card>

        {/* Output Results */}
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Price Breakdown</CardTitle>
            {results && (
              <Badge variant="outline" className="bg-teal-50 text-teal-700">
                Estimation Mode
              </Badge>
            )}
          </CardHeader>
          <CardContent className="h-full flex flex-col justify-between">
            {results ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 bg-zinc-50 rounded-lg">
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Estimated Weight</span>
                    <span className="text-3xl font-extrabold">{results.weight} kg</span>
                  </div>
                  <div className="p-4 bg-zinc-50 rounded-lg">
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Cutting Time</span>
                    <span className="text-3xl font-extrabold">{results.estTime} mins</span>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-zinc-50 text-zinc-500 font-medium">
                      <tr>
                        <th className="py-2.5 px-4 text-left">Cost Component</th>
                        <th className="py-2.5 px-4 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-zinc-700">
                      <tr>
                        <td className="py-3 px-4">Raw Material Cost ({material})</td>
                        <td className="py-3 px-4 text-right">₹{results.materialCost.toLocaleString('en-IN')}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">CNC Cutting Cost ({method})</td>
                        <td className="py-3 px-4 text-right">₹{results.cuttingCost.toLocaleString('en-IN')}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Piercing Charge ({holes} holes)</td>
                        <td className="py-3 px-4 text-right">₹{results.piercingCost.toLocaleString('en-IN')}</td>
                      </tr>
                      <tr className="bg-zinc-50/50 font-medium text-zinc-900">
                        <td className="py-3 px-4">Total Production Cost</td>
                        <td className="py-3 px-4 text-right">₹{results.totalBaseCost.toLocaleString('en-IN')}</td>
                      </tr>
                      <tr className="bg-primary/5 font-extrabold text-primary text-base">
                        <td className="py-4 px-4">Quoted Commercial Price ({margin}% Margin)</td>
                        <td className="py-4 px-4 text-right">₹{results.quotedAmount.toLocaleString('en-IN')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" /> Reset
                  </Button>
                  <Button size="sm">
                    <Download className="h-4 w-4 mr-2" /> Save to Quotation
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                <Play className="h-12 w-12 text-zinc-200 mb-3 animate-pulse" />
                <p>Configure variables on the left and click calculate to estimate rates.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
