
import { Button } from '@/components/ui/button';
import { Printer, CheckCircle2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function QualityControl() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 print:hidden">
        <Link to="/work-orders">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">Quality Control</h2>
          <p className="text-muted-foreground">Digital test certificates and inspection reports.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print Certificate
          </Button>
          <Button>
            <ShieldCheck className="mr-2 h-4 w-4" /> Final Approval
          </Button>
        </div>
      </div>

      {/* Printable Area */}
      <div className="bg-white text-black p-8 shadow-sm border rounded-lg max-w-4xl mx-auto print:shadow-none print:border-none print:p-0">
        
        {/* Header */}
        <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-primary mb-1">SUMESH PETROLEUM PVT. LTD.</h1>
          <p className="text-sm text-gray-600 mb-2">Makarpura GIDC, Vadodara, Gujarat - 390010 (AN ISO 9001:2015 CERTIFIED COMPANY)</p>
          <div className="bg-zinc-100 py-2 border border-gray-300 mt-4">
            <h2 className="text-xl font-bold tracking-widest uppercase">Factory Test Certificate</h2>
          </div>
        </div>

        {/* Machine Meta */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8 text-sm">
          <div className="flex border-b border-gray-200 pb-1">
            <span className="font-semibold w-32">Certificate No:</span>
            <span>TC-26-085</span>
          </div>
          <div className="flex border-b border-gray-200 pb-1">
            <span className="font-semibold w-32">Date of Test:</span>
            <span>28-Jun-2026</span>
          </div>
          <div className="flex border-b border-gray-200 pb-1">
            <span className="font-semibold w-32">Customer:</span>
            <span className="font-medium">Tata Power</span>
          </div>
          <div className="flex border-b border-gray-200 pb-1">
            <span className="font-semibold w-32">PO Ref:</span>
            <span>PO/TP/2026/044</span>
          </div>
          <div className="flex border-b border-gray-200 pb-1">
            <span className="font-semibold w-32">Equipment:</span>
            <span>Transformer Oil Filtration Plant</span>
          </div>
          <div className="flex border-b border-gray-200 pb-1">
            <span className="font-semibold w-32">Capacity:</span>
            <span>10000 LPH</span>
          </div>
          <div className="flex border-b border-gray-200 pb-1">
            <span className="font-semibold w-32">Machine S.No:</span>
            <span>SP/26/1012</span>
          </div>
        </div>

        {/* Test Readings Table */}
        <div className="mb-8">
          <h3 className="font-bold text-lg mb-2">1. Visual & Dimensional Checks</h3>
          <table className="w-full text-sm border-collapse border border-gray-300 mb-6">
            <thead className="bg-zinc-100">
              <tr>
                <th className="border border-gray-300 px-3 py-2 text-left w-12">Sr.</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Parameter Checked</th>
                <th className="border border-gray-300 px-3 py-2 text-left w-48">Standard Requirement</th>
                <th className="border border-gray-300 px-3 py-2 text-center w-32">Observation</th>
                <th className="border border-gray-300 px-3 py-2 text-center w-24">Result</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-3 py-2 text-center">1.1</td>
                <td className="border border-gray-300 px-3 py-2">Overall Dimensions</td>
                <td className="border border-gray-300 px-3 py-2">As per approved GA</td>
                <td className="border border-gray-300 px-3 py-2 text-center">Found OK</td>
                <td className="border border-gray-300 px-3 py-2 text-center text-green-600"><CheckCircle2 className="w-5 h-5 mx-auto" /></td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 text-center">1.2</td>
                <td className="border border-gray-300 px-3 py-2">Painting & Finish</td>
                <td className="border border-gray-300 px-3 py-2">RAL 5012 (Light Blue)</td>
                <td className="border border-gray-300 px-3 py-2 text-center">Matching</td>
                <td className="border border-gray-300 px-3 py-2 text-center text-green-600"><CheckCircle2 className="w-5 h-5 mx-auto" /></td>
              </tr>
            </tbody>
          </table>

          <h3 className="font-bold text-lg mb-2">2. Functional & Performance Tests</h3>
          <table className="w-full text-sm border-collapse border border-gray-300">
            <thead className="bg-zinc-100">
              <tr>
                <th className="border border-gray-300 px-3 py-2 text-left w-12">Sr.</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Test Description</th>
                <th className="border border-gray-300 px-3 py-2 text-center">Rated Value</th>
                <th className="border border-gray-300 px-3 py-2 text-center">Observed Value</th>
                <th className="border border-gray-300 px-3 py-2 text-center w-24">Result</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-3 py-2 text-center">2.1</td>
                <td className="border border-gray-300 px-3 py-2">Vacuum Drop Test (Degassing Chamber)</td>
                <td className="border border-gray-300 px-3 py-2 text-center">&lt; 5 torr/hr</td>
                <td className="border border-gray-300 px-3 py-2 text-center">1.2 torr/hr</td>
                <td className="border border-gray-300 px-3 py-2 text-center text-green-600"><CheckCircle2 className="w-5 h-5 mx-auto" /></td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 text-center">2.2</td>
                <td className="border border-gray-300 px-3 py-2">Heater Insulation Resistance</td>
                <td className="border border-gray-300 px-3 py-2 text-center">&gt; 2 MΩ</td>
                <td className="border border-gray-300 px-3 py-2 text-center">50 MΩ</td>
                <td className="border border-gray-300 px-3 py-2 text-center text-green-600"><CheckCircle2 className="w-5 h-5 mx-auto" /></td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 text-center">2.3</td>
                <td className="border border-gray-300 px-3 py-2">Oil Flow Rate (using flowmeter)</td>
                <td className="border border-gray-300 px-3 py-2 text-center">10000 LPH</td>
                <td className="border border-gray-300 px-3 py-2 text-center">10150 LPH</td>
                <td className="border border-gray-300 px-3 py-2 text-center text-green-600"><CheckCircle2 className="w-5 h-5 mx-auto" /></td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 text-center">2.4</td>
                <td className="border border-gray-300 px-3 py-2">BDV Test (Break Down Voltage after 1 pass)</td>
                <td className="border border-gray-300 px-3 py-2 text-center">&gt; 70 kV</td>
                <td className="border border-gray-300 px-3 py-2 text-center">78 kV</td>
                <td className="border border-gray-300 px-3 py-2 text-center text-green-600"><CheckCircle2 className="w-5 h-5 mx-auto" /></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Conclusion */}
        <div className="mb-12">
          <h3 className="font-bold text-lg mb-2">3. Remarks</h3>
          <p className="text-sm p-4 border border-gray-300 bg-gray-50 italic">
            The equipment has been manufactured, assembled, and tested as per the approved Quality Assurance Plan (QAP). The performance of the machine is found satisfactory and in accordance with the technical specifications. Cleared for dispatch.
          </p>
        </div>

        {/* Signatures */}
        <div className="flex justify-between items-end pt-8">
          <div className="text-center w-48 relative">
            <div className="absolute -top-8 left-0 right-0 flex justify-center opacity-80 pointer-events-none">
              <div className="border-2 border-teal-600 text-teal-600 px-2 py-1 rounded text-xs font-bold -rotate-12 transform">
                DIGITALLY SIGNED<br/>R. DESAI
              </div>
            </div>
            <div className="border-b border-zinc-400 mb-2 h-16"></div>
            <p className="text-gray-800 font-semibold text-sm">Tested By</p>
            <p className="text-zinc-500 text-xs">QC Engineer</p>
          </div>
          <div className="text-center w-48 relative">
            <div className="absolute -top-10 left-0 right-0 flex justify-center opacity-80 pointer-events-none">
              <div className="border-2 border-green-600 text-green-600 px-2 py-1 rounded text-xs font-bold -rotate-6 transform">
                APPROVED<br/>M. PATEL (PROD. MGR)
              </div>
            </div>
            <div className="border-b border-zinc-400 mb-2 h-16"></div>
            <p className="text-gray-800 font-semibold text-sm">Approved By</p>
            <p className="text-zinc-500 text-xs">Production Manager</p>
          </div>
        </div>

      </div>
    </div>
  );
}
