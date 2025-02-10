'use client';

import React, { useState, ChangeEvent } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { 
  BookOpen, Brain, Clock, Target, 
  GraduationCap, Library, Users, 
  Activity, Award, Coffee
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


interface FormData {
  studyHours: string;
  attendance: string;
  previousGrade: string;
  projectScore: string;
  quizAverage: string;
  studyGroupHours: string;
  tutorialAttendance: string;
  sleepHours: string;
  stressLevel: string;
  extracurricularHours: string;
}


const BMLabs = () => {
  // ...state management
  const [formData, setFormData] = useState<FormData>({
      studyHours: '',
      attendance: '',
      previousGrade: '',
      projectScore: '',
      quizAverage: '',
      studyGroupHours: '',
      tutorialAttendance: '',
      sleepHours: '',
      stressLevel: '',
      extracurricularHours: ''
  });

  const [prediction, setPrediction] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const [featureImportance, setFeatureImportance] = useState(null);


  // ... handlers
  const validateInput = (name: string, value: string): string => {
    const limits: {
        [key: string]: { min: number; max: number }
    } = {
        studyHours: { min: 0, max: 168 },
        attendance: { min: 0, max: 100 },
        previousGrade: { min: 0, max: 100 },
        projectScore: { min: 0, max: 100 },
        quizAverage: { min: 0, max: 100 },
        studyGroupHours: { min: 0, max: 50 },
        tutorialAttendance: { min: 0, max: 100 },
        sleepHours: { min: 0, max: 24 },
        stressLevel: { min: 1, max: 10 },
        extracurricularHours: { min: 0, max: 40 }
    };

    const num = parseFloat(value);
    if (isNaN(num)) return "Please enter a valid number";
    if (num < limits[name].min) return `Minimum value is ${limits[name].min}`;
    if (num > limits[name].max) return `Maximum value is ${limits[name].max}`;
    return "";
};


    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      const error = validateInput(name, value);
      setError(error);
    };

  const predictGrade = async () => {
    if (error) return;
    setLoading(true);
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      setPrediction(data.prediction);
      setFeatureImportance(data.featureImportance);
    } catch (error) {
      console.error('Error:', error);
      setError('Prediction failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black font-['DM_Sans']">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Minimalist Header */}
        <div className="mb-16">
          <div className="flex items-center justify-center space-x-4 mb-2">
            <Brain className="w-8 h-8 text-[#ff6b6b]" />
            <h1 className="text-4xl text-white tracking-tight font-bold">
              BMLabs
            </h1>
          </div>
          <p className="text-center text-neutral-500 text-sm tracking-wider font-semibold">
            GRADE PREDICTION
          </p>
        </div>

        <Card className="bg-neutral-900 border-0">
          <CardHeader className="border-b border-neutral-800 px-8 py-6">
            <h2 className="text-white text-lg font-light tracking-wide">Input Metrics</h2>
          </CardHeader>
          
          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Input Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(formData).map(([key, value]) => (
                  <div key={key}>
                    <label className="flex items-center text-neutral-400 text-sm mb-2 font-semibold">
                      {key === 'studyHours' && <Clock className="w-4 h-4 mr-2 text-[#ff6b6b]" />}
                      {key === 'attendance' && <Users className="w-4 h-4 mr-2 text-[#ff6b6b]" />}
                      {key === 'previousGrade' && <Target className="w-4 h-4 mr-2 text-[#ff6b6b]" />}
                      {key === 'projectScore' && <Award className="w-4 h-4 mr-2 text-[#ff6b6b]" />}
                      {key === 'quizAverage' && <BookOpen className="w-4 h-4 mr-2 text-[#ff6b6b]" />}
                      {key === 'studyGroupHours' && <Library className="w-4 h-4 mr-2 text-[#ff6b6b]" />}
                      {key === 'tutorialAttendance' && <GraduationCap className="w-4 h-4 mr-2 text-[#ff6b6b]" />}
                      {key === 'sleepHours' && <Activity className="w-4 h-4 mr-2 text-[#ff6b6b]" />}
                      {key === 'stressLevel' && <Brain className="w-4 h-4 mr-2 text-[#ff6b6b]" />}
                      {key === 'extracurricularHours' && <Coffee className="w-4 h-4 mr-2 text-[#ff6b6b]" />}
                      {key.split(/(?=[A-Z])/).join(' ')}
                    </label>
                    <input
                      type="text"
                      name={key}
                      value={value}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-black border border-neutral-800 
                               text-white placeholder-neutral-700 font-medium
                               focus:outline-none focus:border-[#ff6b6b] 
                               transition-colors"
                      placeholder={`Enter ${key.split(/(?=[A-Z])/).join(' ').toLowerCase()}`}
                    />
                  </div>
                ))}
              </div>

              {error && (
                <div className="text-[#ff6b6b] text-center p-4 bg-[#ff6b6b]/10 font-medium">
                  {error}
                </div>
              )}

              {/* Predict Button */}
              <div className="flex justify-center pt-4">
                <button
                    onClick={predictGrade}
                    disabled={loading || error.length > 0}
                    className="px-8 py-3 bg-[#ff6b6b] text-white text-sm tracking-wider font-bold
                            hover:bg-[#ff5252] disabled:opacity-50 disabled:cursor-not-allowed
                            transition-colors"
                >
                    {loading ? 'PROCESSING...' : 'PREDICT GRADE'}
                </button>
              </div>

              {/* Results Section */}
              {prediction && (
                <div className="mt-12 pt-12 border-t border-neutral-800">
                  <div className="text-center mb-12">
                    <div className="text-6xl font-bold text-white mb-2">
                      {prediction}%
                    </div>
                    <div className="text-neutral-500 text-sm tracking-wider font-semibold">
                      PREDICTED GRADE
                    </div>
                  </div>

                  {/* Feature Importance Chart */}
                  {featureImportance && (
                    <div className="mt-12">
                      <h4 className="text-white text-sm tracking-wider font-bold mb-6">
                        FEATURE IMPORTANCE
                      </h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={featureImportance}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                            <XAxis 
                              dataKey="name" 
                              angle={-45} 
                              textAnchor="end" 
                              height={60}
                              tick={{ fill: '#737373' }}
                            />
                            <YAxis tick={{ fill: '#737373' }} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#171717',
                                border: '1px solid #262626'
                              }}
                            />
                            <Bar dataKey="importance" fill="#ff6b6b" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BMLabs;