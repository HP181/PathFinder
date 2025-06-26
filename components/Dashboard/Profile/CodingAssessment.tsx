'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/Store/Auth-Store';
import { useProfileStore } from '@/lib/Store/ProfileStore';
import { 
  generateCodingQuestions, 
  submitCodingAnswers, 
  getUserCodingAssessments, 
  type CodingAssessment as ICodingAssessment, 
  type CodingQuestion, 
  type CodingAnswer,
  type CodingReview
} from '@/lib/Firebase/Firestore';
import { Loader2, CheckCircle, XCircle, AlertCircle, Code, FileQuestion, FileCheck, RefreshCw } from 'lucide-react';
import Editor from '@monaco-editor/react';

const PROGRAMMING_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'swift', label: 'Swift' }
];

// Get appropriate language starter code
const getStarterCode = (language: string) => {
  switch (language) {
    case 'javascript':
      return '// Write your JavaScript solution here\n\nfunction solution() {\n  // Your code here\n}\n\n// Example usage\nsolution();';
    case 'typescript':
      return '// Write your TypeScript solution here\n\nfunction solution(): void {\n  // Your code here\n}\n\n// Example usage\nsolution();';
    case 'python':
      return '# Write your Python solution here\n\ndef solution():\n    # Your code here\n    pass\n\n# Example usage\nsolution()';
    case 'java':
      return 'public class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n\n    public static void solution() {\n        // Your code here\n    }\n}';
    case 'csharp':
      return 'using System;\n\npublic class Solution {\n    public static void Main() {\n        // Your code here\n    }\n\n    public static void Solution() {\n        // Your code here\n    }\n}';
    case 'cpp':
      return '#include <iostream>\n\nvoid solution() {\n    // Your code here\n}\n\nint main() {\n    solution();\n    return 0;\n}';
    case 'go':
      return 'package main\n\nimport "fmt"\n\nfunc solution() {\n    // Your code here\n}\n\nfunc main() {\n    solution()\n}';
    case 'ruby':
      return '# Write your Ruby solution here\n\ndef solution\n  # Your code here\nend\n\n# Example usage\nsolution';
    case 'php':
      return '<?php\n\nfunction solution() {\n    // Your code here\n}\n\n// Example usage\nsolution();\n?>';
    case 'swift':
      return 'func solution() {\n    // Your code here\n}\n\n// Example usage\nsolution()';
    default:
      return '// Write your solution here';
  }
};

// Helper to format difficulty badge
const DifficultyBadge = ({ difficulty }: { difficulty: string }) => {
  const color = difficulty === 'easy' 
    ? 'bg-green-100 text-green-800' 
    : difficulty === 'medium'
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-red-100 text-red-800';
  
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </span>
  );
};

// Review score component
const ScoreDisplay = ({ label, score }: { label: string; score: number }) => {
  const getColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <span className={`font-medium ${getColor(score)}`}>{score}/100</span>
    </div>
  );
};

export function CodingAssessment() {
  const { user } = useAuthStore();
  const { profile } = useProfileStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessments, setAssessments] = useState<ICodingAssessment[]>([]);
  const [activeAssessment, setActiveAssessment] = useState<ICodingAssessment | null>(null);
  const [activeTab, setActiveTab] = useState('questions');
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, CodingAnswer>>({});
  const [languages, setLanguages] = useState<Record<string, string>>({});
  
  // Load user's assessments on mount
  useEffect(() => {
    if (user) {
      loadAssessments();
    }
  }, [user]);
  
  // Load existing assessments
  const loadAssessments = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const userAssessments = await getUserCodingAssessments(user.uid);
      setAssessments(userAssessments);
      
      // If there are assessments and none is active, set the first one
      if (userAssessments.length > 0 && !activeAssessment) {
        setActiveAssessment(userAssessments[0]);
        
        // Initialize answers from existing data if available
        if (userAssessments[0].answers) {
          setAnswers(userAssessments[0].answers);
          
          // Extract languages
          const langs: Record<string, string> = {};
          Object.entries(userAssessments[0].answers).forEach(([qId, answer]) => {
            langs[qId] = answer.language;
          });
          setLanguages(langs);
        } else {
          // Initialize with default languages
          const langs: Record<string, string> = {};
          userAssessments[0].questions.forEach(q => {
            langs[q.id] = 'javascript'; // Default to JavaScript
          });
          setLanguages(langs);
        }
      }
    } catch (error) {
      console.error('Error loading assessments:', error);
      toast.error('Failed to load coding assessments');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate new coding questions
  const handleGenerateQuestions = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const assessment = await generateCodingQuestions(user.uid);
      
      if (assessment) {
        toast.success('New coding assessment generated');
        
        // Add to assessments list
        setAssessments([assessment, ...assessments]);
        
        // Set as active
        setActiveAssessment(assessment);
        setActiveQuestionIndex(0);
        
        // Initialize answers and languages
        setAnswers({});
        const langs: Record<string, string> = {};
        assessment.questions.forEach(q => {
          langs[q.id] = 'javascript'; // Default to JavaScript
        });
        setLanguages(langs);
        
        // Switch to questions tab
        setActiveTab('questions');
      } else {
        toast.error('Failed to generate coding assessment');
      }
    } catch (error) {
      console.error('Error generating coding assessment:', error);
      toast.error('Error generating coding assessment');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle code change
  const handleCodeChange = (questionId: string, value: string | undefined) => {
    if (!value) return;
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        answer: value,
        language: languages[questionId] || 'javascript',
        submittedAt: prev[questionId]?.submittedAt || new Date().toISOString()
      }
    }));
  };
  
  // Handle language change
  const handleLanguageChange = (questionId: string, language: string) => {
    setLanguages(prev => ({
      ...prev,
      [questionId]: language
    }));
    
    // Update the answer with new language
    if (answers[questionId]) {
      setAnswers(prev => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          language
        }
      }));
    }
  };
  
  // Submit answers for review
  const handleSubmitAnswers = async () => {
    if (!user || !activeAssessment) return;
    
    // Validate that all questions have answers
    const unansweredQuestions = activeAssessment.questions.filter(q => 
      !answers[q.id] || !answers[q.id].answer.trim()
    );
    
    if (unansweredQuestions.length > 0) {
      toast.warning(`Please answer all questions before submitting (${unansweredQuestions.length} remaining)`);
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Submit answers for review
      const updatedAssessment = await submitCodingAnswers(
        user.uid,
        activeAssessment.id,
        answers
      );
      
      if (updatedAssessment) {
        toast.success('Answers submitted and reviewed successfully');
        
        // Update active assessment with reviews
        setActiveAssessment(updatedAssessment);
        
        // Update in assessments list
        setAssessments(prev => 
          prev.map(a => a.id === updatedAssessment.id ? updatedAssessment : a)
        );
        
        // Switch to review tab
        setActiveTab('review');
      } else {
        toast.error('Failed to submit and review answers');
      }
    } catch (error) {
      console.error('Error submitting answers:', error);
      toast.error('Error submitting answers for review');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get active question
  const activeQuestion = activeAssessment?.questions[activeQuestionIndex] || null;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Coding Assessment</CardTitle>
            <CardDescription>
              Test your coding skills with questions tailored to your resume
            </CardDescription>
          </div>
          <Button 
            onClick={handleGenerateQuestions} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate New Assessment
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent>
          {!user ? (
            <div className="text-center py-6">
              <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-4" />
              <p className="text-lg font-medium">Please log in to access coding assessments</p>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <p className="text-lg font-medium">Loading assessments...</p>
            </div>
          ) : assessments.length === 0 ? (
            <div className="text-center py-10">
              <FileQuestion className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">No coding assessments yet</p>
              <p className="text-muted-foreground mb-6">Generate a new assessment based on your resume</p>
              <Button onClick={handleGenerateQuestions}>
                <FileQuestion className="mr-2 h-4 w-4" />
                Generate Coding Assessment
              </Button>
            </div>
          ) : (
            <>
              {/* Assessment selector */}
              {assessments.length > 1 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Select Assessment
                  </label>
                  <Select
                    value={activeAssessment?.id}
                    onValueChange={(value) => {
                      const selected = assessments.find(a => a.id === value);
                      if (selected) {
                        setActiveAssessment(selected);
                        setActiveQuestionIndex(0);
                        
                        // Initialize answers from existing data if available
                        if (selected.answers) {
                          setAnswers(selected.answers);
                          
                          // Extract languages
                          const langs: Record<string, string> = {};
                          Object.entries(selected.answers).forEach(([qId, answer]) => {
                            langs[qId] = answer.language;
                          });
                          setLanguages(langs);
                        } else {
                          // Reset answers
                          setAnswers({});
                          // Initialize with default languages
                          const langs: Record<string, string> = {};
                          selected.questions.forEach(q => {
                            langs[q.id] = 'javascript'; // Default to JavaScript
                          });
                          setLanguages(langs);
                        }
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an assessment" />
                    </SelectTrigger>
                    <SelectContent>
                      {assessments.map((assessment) => (
                        <SelectItem key={assessment.id} value={assessment.id}>
                          {assessment.title} ({new Date(assessment.createdAt).toLocaleDateString()})
                          {assessment.status === 'reviewed' && ' ✓'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {activeAssessment && (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">{activeAssessment.title}</h2>
                    <p className="text-muted-foreground">{activeAssessment.description}</p>
                    
                    <div className="flex items-center mt-2">
                      <Badge className={
                        activeAssessment.status === 'reviewed' ? 'bg-green-100 text-green-800' :
                        activeAssessment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        activeAssessment.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {activeAssessment.status === 'reviewed' ? 'Reviewed' :
                         activeAssessment.status === 'completed' ? 'Completed' :
                         activeAssessment.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                      </Badge>
                      <span className="text-sm text-muted-foreground ml-4">
                        Created: {new Date(activeAssessment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-2">
                      <TabsTrigger value="questions" disabled={!activeAssessment.questions.length}>
                        <FileQuestion className="h-4 w-4 mr-2" />
                        Questions
                      </TabsTrigger>
                      <TabsTrigger value="review" disabled={!activeAssessment.reviews}>
                        <FileCheck className="h-4 w-4 mr-2" />
                        Review
                      </TabsTrigger>
                    </TabsList>
                    
                    {/* Questions Tab */}
                    <TabsContent value="questions" className="space-y-4">
                      {activeAssessment.questions.length > 0 && (
                        <>
                          {/* Question navigation */}
                          <div className="flex space-x-1 mb-4">
                            {activeAssessment.questions.map((q, index) => (
                              <Button
                                key={q.id}
                                variant={index === activeQuestionIndex ? "default" : "outline"}
                                className="w-10 h-10 p-0 rounded-full"
                                onClick={() => setActiveQuestionIndex(index)}
                              >
                                {index + 1}
                              </Button>
                            ))}
                          </div>
                          
                          {/* Active question */}
                          {activeQuestion && (
                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <h3 className="text-lg font-medium">
                                    Question {activeQuestionIndex + 1} of {activeAssessment.questions.length}
                                  </h3>
                                  <DifficultyBadge difficulty={activeQuestion.difficulty} />
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
                                  <pre className="whitespace-pre-wrap text-sm">
                                    {activeQuestion.question}
                                  </pre>
                                  
                                  {activeQuestion.expectedOutput && (
                                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                      <p className="font-medium text-sm">Expected Output/Criteria:</p>
                                      <p className="text-sm mt-1 text-muted-foreground">
                                        {activeQuestion.expectedOutput}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Programming language selector */}
                              <div>
                                <label className="block text-sm font-medium mb-2">
                                  Programming Language
                                </label>
                                <Select
                                  value={languages[activeQuestion.id] || 'javascript'}
                                  onValueChange={(value) => handleLanguageChange(activeQuestion.id, value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select language" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {PROGRAMMING_LANGUAGES.map((lang) => (
                                      <SelectItem key={lang.value} value={lang.value}>
                                        {lang.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              {/* Code editor */}
                              <div className="h-96 border rounded-md overflow-hidden">
                                <Editor
                                  height="100%"
                                  defaultLanguage={languages[activeQuestion.id] || 'javascript'}
                                  language={languages[activeQuestion.id] || 'javascript'}
                                  value={answers[activeQuestion.id]?.answer || getStarterCode(languages[activeQuestion.id] || 'javascript')}
                                  onChange={(value) => handleCodeChange(activeQuestion.id, value)}
                                  theme="vs-dark"
                                  options={{
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    fontSize: 14,
                                    tabSize: 2,
                                  }}
                                />
                              </div>
                              
                              {/* Question navigation buttons */}
                              <div className="flex justify-between">
                                <Button 
                                  variant="outline"
                                  onClick={() => setActiveQuestionIndex(prev => Math.max(0, prev - 1))}
                                  disabled={activeQuestionIndex === 0}
                                >
                                  Previous
                                </Button>
                                <Button 
                                  variant="outline"
                                  onClick={() => setActiveQuestionIndex(prev => Math.min(activeAssessment.questions.length - 1, prev + 1))}
                                  disabled={activeQuestionIndex === activeAssessment.questions.length - 1}
                                >
                                  Next
                                </Button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </TabsContent>
                    
                    {/* Review Tab */}
                    <TabsContent value="review" className="space-y-4">
                      {activeAssessment.reviews && Object.keys(activeAssessment.reviews).length > 0 ? (
                        <>
                          {/* Overall scores */}
                          <Card>
                            <CardHeader>
                              <CardTitle>Overall Performance</CardTitle>
                              <CardDescription>
                                Summary of your coding assessment results
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                {['correctness', 'efficiency', 'readability'].map((metric) => {
                                  // Calculate average score for this metric across all questions
                                  const scores = Object.values(activeAssessment.reviews || {}).map(
                                    (review: any) => review[metric] || 0
                                  );
                                  const avgScore = scores.length 
                                    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
                                    : 0;
                                  
                                  return (
                                    <Card key={metric} className="overflow-hidden">
                                      <CardHeader className="p-4">
                                        <CardTitle className="text-base capitalize">
                                          {metric}
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent className="p-4 pt-0">
                                        <div className="text-3xl font-bold">
                                          {avgScore}/100
                                        </div>
                                        <div 
                                          className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden"
                                        >
                                          <div 
                                            className={`h-full ${
                                              avgScore >= 80 ? 'bg-green-500' : 
                                              avgScore >= 60 ? 'bg-yellow-500' : 
                                              'bg-red-500'
                                            }`}
                                            style={{ width: `${avgScore}%` }}
                                          />
                                        </div>
                                      </CardContent>
                                    </Card>
                                  );
                                })}
                              </div>
                              
                              {/* Calculate overall average */}
                              {(() => {
                                const overallScores = Object.values(activeAssessment.reviews || {}).map(
                                  (review: any) => review.overallScore || 0
                                );
                                const overallAvg = overallScores.length 
                                  ? Math.round(overallScores.reduce((a, b) => a + b, 0) / overallScores.length) 
                                  : 0;
                                
                                return (
                                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
                                    <span className="text-lg font-medium">Overall Assessment Score</span>
                                    <span className={`text-xl font-bold ${
                                      overallAvg >= 80 ? 'text-green-600' : 
                                      overallAvg >= 60 ? 'text-yellow-600' : 
                                      'text-red-600'
                                    }`}>
                                      {overallAvg}/100
                                    </span>
                                  </div>
                                );
                              })()}
                            </CardContent>
                          </Card>
                          
                          {/* Question-specific reviews */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">Detailed Reviews</h3>
                            
                            {activeAssessment.questions.map((question, index) => {
                              const review = activeAssessment.reviews?.[question.id];
                              const answer = activeAssessment.answers?.[question.id];
                              
                              if (!review || !answer) return null;
                              
                              return (
                                <Card key={question.id} className="overflow-hidden">
                                  <CardHeader>
                                    <div className="flex items-center justify-between">
                                      <CardTitle className="text-base">Question {index + 1}</CardTitle>
                                      <DifficultyBadge difficulty={question.difficulty} />
                                    </div>
                                    <CardDescription>
                                      {question.category}
                                    </CardDescription>
                                  </CardHeader>
                                  
                                  <CardContent className="p-4 pt-0">
                                    <div className="space-y-4">
                                      {/* Question text */}
                                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                                        <p className="text-sm font-medium mb-1">Question:</p>
                                        <p className="text-sm whitespace-pre-wrap">{question.question}</p>
                                      </div>
                                      
                                      {/* Your answer */}
                                      <div>
                                        <p className="text-sm font-medium mb-1">Your Answer ({answer.language}):</p>
                                        <div className="max-h-40 overflow-auto rounded-md border">
                                          <pre className="p-3 text-sm overflow-x-auto">
                                            <code>{answer.answer}</code>
                                          </pre>
                                        </div>
                                      </div>
                                      
                                      {/* Scores */}
                                      <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                                        <ScoreDisplay label="Correctness" score={review.correctness} />
                                        <ScoreDisplay label="Efficiency" score={review.efficiency} />
                                        <ScoreDisplay label="Readability" score={review.readability} />
                                        <ScoreDisplay label="Overall" score={review.overallScore} />
                                      </div>
                                      
                                      {/* Feedback */}
                                      <div>
                                        <p className="text-sm font-medium mb-1">Feedback:</p>
                                        <p className="text-sm text-muted-foreground">{review.feedback}</p>
                                      </div>
                                      
                                      {/* Improvements */}
                                      <div>
                                        <p className="text-sm font-medium mb-1">Suggested Improvements:</p>
                                        <ul className="list-disc pl-5 space-y-1">
                                          {review.improvements.map((improvement: string, i: number) => (
                                            <li key={i} className="text-sm text-muted-foreground">{improvement}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-10">
                          <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                          <p className="text-lg font-medium mb-2">Assessment Not Yet Reviewed</p>
                          <p className="text-muted-foreground mb-6">
                            Submit your answers to receive detailed feedback
                          </p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </>
              )}
            </>
          )}
        </CardContent>
        {activeAssessment && !activeAssessment.reviews && (
          <CardFooter className="flex justify-end">
            <Button 
              onClick={handleSubmitAnswers} 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <FileCheck className="mr-2 h-4 w-4" />
                  Submit for Review
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}