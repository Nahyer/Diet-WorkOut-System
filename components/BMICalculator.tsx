import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function BMICalculator() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState("");

  const calculateBMI = () => {
    if (weight && height) {
      const heightInMeters = parseFloat(height);
      const weightInKg = parseFloat(weight);
      if (heightInMeters > 0 && weightInKg > 0) {
        const bmiValue = parseFloat((weightInKg / (heightInMeters * heightInMeters)).toFixed(1));
        setBmi(bmiValue);

        let bmiCategory = "";
        if (bmiValue < 18.5) {
          bmiCategory = "Underweight";
        } else if (bmiValue >= 18.5 && bmiValue < 24.9) {
          bmiCategory = "Normal weight";
        } else if (bmiValue >= 25 && bmiValue < 29.9) {
          bmiCategory = "Overweight";
        } else {
          bmiCategory = "Obese";
        }
        setCategory(bmiCategory);
      }
    }
  };

  const getProgress = () => {
    if (!bmi) return 0;
    if (bmi < 18.5) return 25;
    if (bmi < 24.9) return 50;
    if (bmi < 29.9) return 75;
    return 100;
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Quick BMI Calculator</h2>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <input
              type="number"
              placeholder="Weight (kg)"
              className="flex-1 p-3 border rounded-lg"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
            <input
              type="number"
              placeholder="Height (m)"
              className="flex-1 p-3 border rounded-lg"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>
          <Button className="bg-red-500 hover:bg-red-600 w-full sm:w-auto" onClick={calculateBMI}>
            Calculate BMI
          </Button>

          {bmi !== null && (
            <div className="mt-6 text-center">
              <h3 className="text-lg font-semibold">Your BMI: {bmi}</h3>
              <p className="text-sm text-gray-600">Category: {category}</p>
              <div className="w-full bg-gray-200 rounded-full h-4 mt-4 relative">
                <div
                  className={`h-4 rounded-full transition-all ${
                    bmi < 18.5
                      ? "bg-blue-500"
                      : bmi < 24.9
                      ? "bg-green-500"
                      : bmi < 29.9
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${getProgress()}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
