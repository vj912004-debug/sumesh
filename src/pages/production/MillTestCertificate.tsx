import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileText, Printer, Shield, CheckCircle } from 'lucide-react';

export default function MillTestCertificate() {
  const [plateNo, setPlateNo] = useState('PL-3091');
  const [heatNo, setHeatNo] = useState('HT-9018');
  const [grade, setGrade] = useState('IS 2062 Gr B');
  const [thickness, setThickness] = useState('16');
  const [size, setSize] = useState('2500 x 6000');
  
  // Chemical Composition (%)
  const [carbon, setCarbon] = useState('0.18');
  const [manganese, setManganese] = useState('1.25');
  const [silicon, setSilicon] = useState('0.22');
  const [phosphorus, setPhosphorus] = useState('0.025');
  const [sulfur, setSulfur] = useState('0.015');

  // Mechanical Properties
  const [yieldStrength, setYieldStrength] = useState('310'); // MPa
  const [tensileStrength, setTensileStrength] = useState('440'); // MPa
  const [elongation, setElongation] = useState('24'); // %

  const [mtcData, setMtcData] = useState<any>(null);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setMtcData({
      certNo: `MTC-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleDateString('en-IN'),
      plateNo,
      heatNo,
      grade,
      dimensions: `${size} x ${thickness} mm`,
      chemistry: { C: carbon, Mn: manganese, Si: silicon, P: phosphorus, S: sulfur },
      mechanical: { yield: yieldStrength, tensile: tensileStrength, elongation }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Mill Test Certificate (MTC)</h2>
        <p className="text-muted-foreground">Manage and issue material test certificates certifying steel grade chemical and physical properties.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Input parameters */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Certificate Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Plate ID / Heat ID</label>
                <Input value={plateNo} onChange={e => setPlateNo(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Heat Number</label>
                <Input value={heatNo} onChange={e => setHeatNo(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Grade</label>
                  <Input value={grade} onChange={e => setGrade(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Thick (mm)</label>
                  <Input value={thickness} onChange={e => setThickness(e.target.value)} required />
                </div>
              </div>
              
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider pt-2 border-t">Chemical Analysis (%)</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-500">Carbon (C)</label>
                  <Input value={carbon} onChange={e => setCarbon(e.target.value)} className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-500">Manganese (Mn)</label>
                  <Input value={manganese} onChange={e => setManganese(e.target.value)} className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-500">Silicon (Si)</label>
                  <Input value={silicon} onChange={e => setSilicon(e.target.value)} className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-500">Phosphorus (P)</label>
                  <Input value={phosphorus} onChange={e => setPhosphorus(e.target.value)} className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-500">Sulfur (S)</label>
                  <Input value={sulfur} onChange={e => setSulfur(e.target.value)} className="h-8 text-xs" />
                </div>
              </div>

              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider pt-2 border-t">Mechanical Properties</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-500">Yield (MPa)</label>
                  <Input value={yieldStrength} onChange={e => setYieldStrength(e.target.value)} className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-500">Tensile (MPa)</label>
                  <Input value={tensileStrength} onChange={e => setTensileStrength(e.target.value)} className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-500">Elong (%)</label>
                  <Input value={elongation} onChange={e => setElongation(e.target.value)} className="h-8 text-xs" />
                </div>
              </div>

              <Button type="submit" className="w-full mt-4">
                <FileText className="h-4 w-4 mr-2" /> Generate Certificate
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Certificate Display */}
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-zinc-100">
            <CardTitle className="text-lg">Certificate Preview</CardTitle>
            {mtcData && (
              <Button size="sm" variant="outline">
                <Printer className="h-4 w-4 mr-2" /> Print MTC
              </Button>
            )}
          </CardHeader>
          <CardContent className="pt-6">
            {mtcData ? (
              <div className="border border-zinc-300 p-8 rounded-lg bg-white shadow-sm space-y-6 text-zinc-800 font-sans max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center space-y-1 border-b pb-4">
                  <div className="flex justify-center items-center gap-1.5 text-primary text-xl font-bold">
                    <Shield className="h-6 w-6" /> SUMESH PETROLEUM LABS
                  </div>
                  <p className="text-xs text-zinc-500">Makarpara Industrial Estate, Vadodara, Gujarat - 390010</p>
                  <p className="text-sm font-semibold tracking-wide text-zinc-700 pt-2">MATERIAL TEST CERTIFICATE (MTC)</p>
                  <p className="text-xs text-zinc-500">AS PER EN 10204 3.1</p>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-y-2 text-xs">
                  <div><span className="font-semibold">MTC Ref No:</span> {mtcData.certNo}</div>
                  <div className="text-right"><span className="font-semibold">Date of Testing:</span> {mtcData.date}</div>
                  <div><span className="font-semibold">Plate No / Heat No:</span> {mtcData.plateNo} / {mtcData.heatNo}</div>
                  <div className="text-right"><span className="font-semibold">Material Grade:</span> {mtcData.grade}</div>
                  <div><span className="font-semibold">Dimensions:</span> {mtcData.dimensions}</div>
                  <div className="text-right"><span className="font-semibold">Inspection Code:</span> APPROVED</div>
                </div>

                {/* Chemistry Table */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-zinc-600 border-b pb-1">1. CHEMICAL ANALYSIS</h4>
                  <table className="w-full text-xs text-center border divide-y">
                    <thead className="bg-zinc-50 text-zinc-500 font-medium">
                      <tr>
                        <th className="py-2 border-r">Element</th>
                        <th className="py-2 border-r">C</th>
                        <th className="py-2 border-r">Mn</th>
                        <th className="py-2 border-r">Si</th>
                        <th className="py-2 border-r">P</th>
                        <th className="py-2">S</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-2 font-medium border-r bg-zinc-50">Actual (%)</td>
                        <td className="py-2 border-r">{mtcData.chemistry.C}%</td>
                        <td className="py-2 border-r">{mtcData.chemistry.Mn}%</td>
                        <td className="py-2 border-r">{mtcData.chemistry.Si}%</td>
                        <td className="py-2 border-r">{mtcData.chemistry.P}%</td>
                        <td className="py-2">{mtcData.chemistry.S}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Mechanical Table */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-zinc-600 border-b pb-1">2. MECHANICAL PROPERTIES</h4>
                  <table className="w-full text-xs text-center border divide-y">
                    <thead className="bg-zinc-50 text-zinc-500 font-medium">
                      <tr>
                        <th className="py-2 border-r">Test Parameter</th>
                        <th className="py-2 border-r">Yield Strength (MPa)</th>
                        <th className="py-2 border-r">Tensile Strength (MPa)</th>
                        <th className="py-2">Elongation (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-2 font-medium border-r bg-zinc-50">Actual Value</td>
                        <td className="py-2 border-r">{mtcData.mechanical.yield} MPa</td>
                        <td className="py-2 border-r">{mtcData.mechanical.tensile} MPa</td>
                        <td className="py-2">{mtcData.mechanical.elongation}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Footer Signature */}
                <div className="flex justify-between items-end pt-8 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle className="h-4 w-4" /> Lab Certified Traceable
                    </div>
                    <p className="text-zinc-400">UID Signature Valid</p>
                  </div>
                  <div className="text-center space-y-4">
                    <div className="w-32 border-b border-dashed border-zinc-400"></div>
                    <p className="font-semibold text-zinc-600">QA Incharge Signature</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
                <FileText className="h-12 w-12 text-zinc-200 mb-3 animate-pulse" />
                <p>Configure material tests on the left and click generate to review MTC certificate.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
