/**
 * MedReview Pro - Medical Assessment Action App
 * 
 * Professional clinical assessment interface with three-tab workflow:
 * 1. Clinical Review - Patient criteria and medical history
 * 2. Medical Records - Documentation with AI summaries
 * 3. Decision & Correspondence - Structured decision making
 */
import React, { useState, useMemo } from 'react';
import { useActionContext } from '@/hooks/useActionContext';
import { OutcomeButtons } from '@/components/action/OutcomeButtons';
import { ActionFormField } from '@/components/action/ActionFormField';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  AlertCircle, 
  Beaker, 
  User, 
  Heart, 
  Activity, 
  FileCheck, 
  Brain,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  Phone,
  Mail
} from 'lucide-react';
/**
 * Initial data for the form (shown before Action Center sends data)
 */
const INITIAL_DATA = {
  patientName: 'Sarah Johnson',
  faxNumber: '(555) 123-4567',
  emailAddress: 'sarah.johnson@email.com',
};
/**
 * Mock clinical data for demonstration
 */
const MOCK_CLINICAL_DATA = {
  demographics: {
    age: 45,
    gender: 'Female',
    dateOfBirth: '1979-03-15',
    mrn: 'MRN-789456123'
  },
  vitalSigns: {
    bloodPressure: '142/88 mmHg',
    heartRate: '78 bpm',
    temperature: '98.6°F',
    respiratoryRate: '16/min',
    oxygenSaturation: '98%',
    weight: '165 lbs',
    height: '5\'6"'
  },
  medicalHistory: [
    { condition: 'Hypertension', diagnosed: '2018', status: 'Active' },
    { condition: 'Type 2 Diabetes', diagnosed: '2020', status: 'Active' },
    { condition: 'Hyperlipidemia', diagnosed: '2019', status: 'Active' }
  ],
  currentMedications: [
    { name: 'Lisinopril', dosage: '10mg daily', prescriber: 'Dr. Smith' },
    { name: 'Metformin', dosage: '500mg twice daily', prescriber: 'Dr. Johnson' },
    { name: 'Atorvastatin', dosage: '20mg daily', prescriber: 'Dr. Smith' }
  ],
  allergies: [
    { allergen: 'Penicillin', reaction: 'Rash', severity: 'Moderate' },
    { allergen: 'Shellfish', reaction: 'Anaphylaxis', severity: 'Severe' }
  ],
  clinicalCriteria: [
    {
      category: 'Cardiovascular Risk Assessment',
      items: [
        { criterion: 'Blood pressure control', status: 'needs-attention', value: '142/88 mmHg (Target: <130/80)' },
        { criterion: 'Cholesterol levels', status: 'acceptable', value: 'LDL: 95 mg/dL (Target: <100)' },
        { criterion: 'Cardiac risk factors', status: 'high-risk', value: 'Multiple risk factors present' }
      ]
    },
    {
      category: 'Diabetes Management',
      items: [
        { criterion: 'HbA1c level', status: 'acceptable', value: '7.2% (Target: <7%)' },
        { criterion: 'Blood glucose monitoring', status: 'compliant', value: 'Daily monitoring documented' },
        { criterion: 'Diabetic complications screening', status: 'due', value: 'Annual eye exam overdue' }
      ]
    },
    {
      category: 'Medication Compliance',
      items: [
        { criterion: 'Prescription adherence', status: 'good', value: '85% compliance rate' },
        { criterion: 'Drug interactions', status: 'none', value: 'No significant interactions identified' },
        { criterion: 'Side effect monitoring', status: 'ongoing', value: 'Regular monitoring in place' }
      ]
    }
  ]
};
const MOCK_MEDICAL_RECORDS = [
  {
    id: 1,
    type: 'Lab Results',
    date: '2024-01-15',
    provider: 'Central Lab',
    summary: 'Comprehensive metabolic panel and lipid profile',
    aiSummary: 'Recent lab work shows elevated glucose (145 mg/dL) and borderline cholesterol levels. HbA1c at 7.2% indicates diabetes management could be optimized. Kidney function remains normal.',
    keyFindings: ['Elevated glucose', 'Borderline cholesterol', 'Normal kidney function'],
    status: 'reviewed'
  },
  {
    id: 2,
    type: 'Imaging Report',
    date: '2024-01-10',
    provider: 'Radiology Associates',
    summary: 'Chest X-ray and echocardiogram',
    aiSummary: 'Chest imaging shows clear lungs with no acute findings. Echocardiogram reveals mild left ventricular hypertrophy consistent with hypertensive heart disease. Ejection fraction preserved at 55%.',
    keyFindings: ['Clear lungs', 'Mild LV hypertrophy', 'Preserved EF'],
    status: 'reviewed'
  },
  {
    id: 3,
    type: 'Consultation Note',
    date: '2024-01-08',
    provider: 'Dr. Martinez, Cardiology',
    summary: 'Cardiovascular risk assessment',
    aiSummary: 'Cardiology consultation recommends optimization of blood pressure control and consideration of ACE inhibitor dose adjustment. Patient counseled on lifestyle modifications including diet and exercise.',
    keyFindings: ['BP optimization needed', 'Lifestyle counseling provided', 'Follow-up in 3 months'],
    status: 'reviewed'
  },
  {
    id: 4,
    type: 'Progress Note',
    date: '2024-01-05',
    provider: 'Dr. Thompson, Primary Care',
    summary: 'Routine follow-up visit',
    aiSummary: 'Patient reports good adherence to medications with occasional missed doses. Blood pressure remains elevated despite current therapy. Discussed importance of medication compliance and scheduled lab work.',
    keyFindings: ['Good medication adherence', 'Elevated BP persists', 'Lab work scheduled'],
    status: 'reviewed'
  }
];
function getStatusColor(status: string): string {
  switch (status) {
    case 'acceptable':
    case 'compliant':
    case 'good':
    case 'none':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'needs-attention':
    case 'due':
    case 'ongoing':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'high-risk':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}
function getStatusIcon(status: string) {
  switch (status) {
    case 'acceptable':
    case 'compliant':
    case 'good':
    case 'none':
      return '✓';
    case 'needs-attention':
    case 'due':
    case 'ongoing':
      return '⚠';
    case 'high-risk':
      return '⚠';
    default:
      return '•';
  }
}
/**
 * Clinical Review Tab Component
 */
function ClinicalReviewTab() {
  return (
    <div className="space-y-6">
      {/* Patient Demographics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Patient Demographics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Age</p>
              <p className="text-lg font-semibold">{MOCK_CLINICAL_DATA.demographics.age} years</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Gender</p>
              <p className="text-lg font-semibold">{MOCK_CLINICAL_DATA.demographics.gender}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Date of Birth</p>
              <p className="text-lg font-semibold">{MOCK_CLINICAL_DATA.demographics.dateOfBirth}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">MRN</p>
              <p className="text-lg font-semibold">{MOCK_CLINICAL_DATA.demographics.mrn}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Vital Signs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-red-600" />
            Current Vital Signs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(MOCK_CLINICAL_DATA.vitalSigns).map(([key, value]) => (
              <div key={key} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="text-lg font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Clinical Criteria Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-green-600" />
            Clinical Criteria Assessment
          </CardTitle>
          <CardDescription>
            Detailed evaluation of clinical parameters and treatment goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="space-y-4">
            {MOCK_CLINICAL_DATA.clinicalCriteria.map((category, categoryIndex) => (
              <AccordionItem key={categoryIndex} value={`category-${categoryIndex}`} className="border rounded-lg">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold text-left">{category.category}</span>
                    <Badge variant="outline" className="ml-2">
                      {category.items.length} criteria
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-3">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.criterion}</p>
                          <p className="text-sm text-gray-600 mt-1">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
      {/* Medical History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Medical History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MOCK_CLINICAL_DATA.medicalHistory.map((condition, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{condition.condition}</p>
                    <p className="text-sm text-gray-600">Diagnosed: {condition.diagnosed}</p>
                  </div>
                  <Badge variant={condition.status === 'Active' ? 'default' : 'secondary'}>
                    {condition.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Current Medications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MOCK_CLINICAL_DATA.currentMedications.map((med, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{med.name}</p>
                  <p className="text-sm text-gray-600">{med.dosage}</p>
                  <p className="text-xs text-gray-500">Prescribed by: {med.prescriber}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Allergies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            Known Allergies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_CLINICAL_DATA.allergies.map((allergy, index) => (
              <div key={index} className="p-4 border-l-4 border-orange-400 bg-orange-50 rounded-r-lg">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-orange-900">{allergy.allergen}</p>
                  <Badge variant={allergy.severity === 'Severe' ? 'destructive' : 'secondary'}>
                    {allergy.severity}
                  </Badge>
                </div>
                <p className="text-sm text-orange-700 mt-1">Reaction: {allergy.reaction}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
/**
 * Medical Records Tab Component
 */
function MedicalRecordsTab() {
  const [expandedRecord, setExpandedRecord] = useState<number | null>(null);
  const toggleRecord = (recordId: number) => {
    setExpandedRecord(expandedRecord === recordId ? null : recordId);
  };
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Medical Documentation
          </CardTitle>
          <CardDescription>
            Comprehensive patient records with AI-generated summaries and key findings
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="space-y-4">
        {MOCK_MEDICAL_RECORDS.map((record) => (
          <Card key={record.id} className="transition-all duration-200 hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{record.type}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {record.date}
                      </span>
                      <span>{record.provider}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {record.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleRecord(record.id)}
                    className="p-1"
                  >
                    {expandedRecord === record.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-gray-700 mb-4">{record.summary}</p>
              {/* AI Summary Section */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-900">AI Summary</span>
                </div>
                <p className="text-purple-800 text-sm leading-relaxed">{record.aiSummary}</p>
              </div>
              {/* Key Findings */}
              <div className="mb-4">
                <p className="font-medium text-gray-900 mb-2">Key Findings:</p>
                <div className="flex flex-wrap gap-2">
                  {record.keyFindings.map((finding, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                      {finding}
                    </Badge>
                  ))}
                </div>
              </div>
              {/* Expanded Content */}
              {expandedRecord === record.id && (
                <div className="border-t pt-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Document ID:</p>
                      <p className="text-gray-600">DOC-{record.id.toString().padStart(6, '0')}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Review Status:</p>
                      <p className="text-gray-600 capitalize">{record.status}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Provider:</p>
                      <p className="text-gray-600">{record.provider}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Document Type:</p>
                      <p className="text-gray-600">{record.type}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
/**
 * Decision & Correspondence Tab Component
 */
function DecisionTab({ 
  formData, 
  updateField, 
  completeTask, 
  isReadOnly 
}: {
  formData: any;
  updateField: (field: string, value: any) => void;
  completeTask: (outcome: string) => void;
  isReadOnly: boolean;
}) {
  const isFormValid = formData.reviewerComments && formData.reviewerComments.trim().length > 0;
  const commentLength = formData.reviewerComments?.length || 0;
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-green-600" />
            Clinical Decision & Documentation
          </CardTitle>
          <CardDescription>
            Provide your assessment and decision based on the clinical review and medical records
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Assessment Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Assessment Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-blue-800">High Priority Items:</p>
                <p className="text-blue-700">Blood pressure control, diabetic eye exam</p>
              </div>
              <div>
                <p className="font-medium text-blue-800">Medication Compliance:</p>
                <p className="text-blue-700">85% adherence rate - Good</p>
              </div>
              <div>
                <p className="font-medium text-blue-800">Risk Factors:</p>
                <p className="text-blue-700">Multiple cardiovascular risks present</p>
              </div>
            </div>
          </div>
          {/* Comments Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clinical Assessment Comments *
              </label>
              <div className="relative">
                <ActionFormField
                  name="reviewerComments"
                  label=""
                  type="string"
                  required={true}
                  readOnly={isReadOnly}
                  value={formData.reviewerComments}
                  onChange={(value) => updateField('reviewerComments', value)}
                  multiline={true}
                  placeholder="Provide detailed assessment including clinical findings, risk factors, recommendations, and rationale for your decision..."
                  className="min-h-[120px]"
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                  {commentLength}/1000
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Include your clinical reasoning, key findings, and recommendations for patient care
              </p>
            </div>
            {/* Validation Message */}
            {!isFormValid && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Assessment Required</AlertTitle>
                <AlertDescription>
                  Please provide your clinical assessment comments before making a decision.
                </AlertDescription>
              </Alert>
            )}
          </div>
          {/* Decision Guidelines */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Decision Guidelines</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-green-800 mb-1">Select "Correct" if:</p>
                <ul className="text-green-700 space-y-1 text-xs">
                  <li>• Clinical criteria are appropriately met</li>
                  <li>• Treatment plan is evidence-based</li>
                  <li>• Patient safety considerations addressed</li>
                  <li>• Documentation is complete and accurate</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-red-800 mb-1">Select "Incorrect" if:</p>
                <ul className="text-red-700 space-y-1 text-xs">
                  <li>• Clinical criteria not met or inappropriate</li>
                  <li>• Treatment plan lacks evidence basis</li>
                  <li>• Safety concerns not adequately addressed</li>
                  <li>• Documentation incomplete or inaccurate</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Decision Outcomes */}
      {!isReadOnly && (
        <Card>
          <CardHeader>
            <CardTitle>Clinical Decision</CardTitle>
            <CardDescription>
              Select the appropriate outcome based on your assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OutcomeButtons
              outcomes={['Correct', 'Incorrect']}
              onOutcome={completeTask}
              disabled={!isFormValid}
              className="flex gap-4"
            />
            {!isFormValid && (
              <p className="text-sm text-muted-foreground mt-3">
                Please complete your clinical assessment comments before making a decision.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
/**
 * Main MedReview Pro Action Page Component
 */
export function ActionPage() {
  const {
    taskData,
    formData,
    isReadOnly,
    hasActionCenterData,
    updateField,
    completeTask,
  } = useActionContext({
    initialData: INITIAL_DATA,
  });
  const [activeTab, setActiveTab] = useState('clinical');
  // Memoize patient info to prevent unnecessary re-renders
  const patientInfo = useMemo(() => ({
    name: formData.patientName || 'Unknown Patient',
    fax: formData.faxNumber || 'Not provided',
    email: formData.emailAddress || 'Not provided'
  }), [formData.patientName, formData.faxNumber, formData.emailAddress]);
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          {/* Preview mode indicator */}
          {!hasActionCenterData && (
            <Alert className="mb-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
              <Beaker className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-800 dark:text-yellow-200">Preview Mode</AlertTitle>
              <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                Showing mock clinical data. In Action Center, real patient data will be displayed.
              </AlertDescription>
            </Alert>
          )}
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                <FileCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  MedReview Pro
                </h1>
                <p className="text-muted-foreground">
                  Clinical Assessment & Decision Support
                </p>
              </div>
            </div>
            {/* Patient Information Bar */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold text-blue-900">Patient:</span>
                      <span className="text-blue-800">{patientInfo.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">{patientInfo.fax}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">{patientInfo.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <Clock className="h-4 w-4" />
                    <span>Case ID: {taskData?.id || 'CASE-2024-001'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Read-only notice */}
          {isReadOnly && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Assessment Complete</AlertTitle>
              <AlertDescription>
                This clinical assessment has been completed and is now read-only.
              </AlertDescription>
            </Alert>
          )}
          {/* Main Tabs Interface */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 h-12">
              <TabsTrigger value="clinical" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Clinical Review
              </TabsTrigger>
              <TabsTrigger value="records" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Medical Records
              </TabsTrigger>
              <TabsTrigger value="decision" className="flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                Decision & Correspondence
              </TabsTrigger>
            </TabsList>
            <TabsContent value="clinical" className="space-y-6">
              <ClinicalReviewTab />
            </TabsContent>
            <TabsContent value="records" className="space-y-6">
              <MedicalRecordsTab />
            </TabsContent>
            <TabsContent value="decision" className="space-y-6">
              <DecisionTab
                formData={formData}
                updateField={updateField}
                completeTask={completeTask}
                isReadOnly={isReadOnly}
              />
            </TabsContent>
          </Tabs>
          {/* Footer */}
          <footer className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© Powered by UiPath</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
export default ActionPage;