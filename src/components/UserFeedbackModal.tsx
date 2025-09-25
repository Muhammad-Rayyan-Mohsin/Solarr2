import React, { useState } from "react";
import { Star, MessageSquare, Send, X, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface FeedbackData {
  rating: number;
  category: string;
  comments: string;
  email?: string;
  improvements: string[];
  submitted: boolean;
}

interface UserFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: FeedbackData) => void;
  className?: string;
}

const feedbackCategories = [
  { value: "usability", label: "Usability & Navigation" },
  { value: "performance", label: "Performance & Speed" },
  { value: "design", label: "Design & Layout" },
  { value: "functionality", label: "Functionality" },
  { value: "content", label: "Content & Information" },
  { value: "technical", label: "Technical Issues" },
  { value: "other", label: "Other" },
];

const improvementSuggestions = [
  "Better mobile experience",
  "Faster loading times",
  "Clearer instructions",
  "More photo examples",
  "Better validation messages",
  "Improved navigation",
  "More help tooltips",
  "Better error handling",
];

export function UserFeedbackModal({
  isOpen,
  onClose,
  onSubmit,
  className,
}: UserFeedbackModalProps) {
  const [feedback, setFeedback] = useState<FeedbackData>({
    rating: 0,
    category: "",
    comments: "",
    email: "",
    improvements: [],
    submitted: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingChange = (rating: number) => {
    setFeedback(prev => ({ ...prev, rating }));
  };

  const handleCategoryChange = (category: string) => {
    setFeedback(prev => ({ ...prev, category }));
  };

  const handleCommentsChange = (comments: string) => {
    setFeedback(prev => ({ ...prev, comments }));
  };

  const handleEmailChange = (email: string) => {
    setFeedback(prev => ({ ...prev, email }));
  };

  const handleImprovementToggle = (improvement: string) => {
    setFeedback(prev => ({
      ...prev,
      improvements: prev.improvements.includes(improvement)
        ? prev.improvements.filter(i => i !== improvement)
        : [...prev.improvements, improvement]
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(feedback);
      setFeedback(prev => ({ ...prev, submitted: true }));
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = feedback.rating > 0 && feedback.category && feedback.comments.trim();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className={cn("w-full max-w-2xl max-h-[90vh] overflow-y-auto", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold text-foreground">
            Share Your Feedback
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {feedback.submitted ? (
            <div className="text-center space-y-4 py-8">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <ThumbsUp className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Thank You for Your Feedback!
                </h3>
                <p className="text-muted-foreground">
                  Your input helps us improve the survey experience for everyone.
                </p>
              </div>
              <Button onClick={onClose} className="mt-4">
                Close
              </Button>
            </div>
          ) : (
            <>
              {/* Rating */}
              <div className="space-y-3">
                <Label className="text-base font-medium text-foreground">
                  How would you rate your overall experience?
                </Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(star)}
                      className={cn(
                        "transition-colors hover:scale-110",
                        feedback.rating >= star
                          ? "text-yellow-500"
                          : "text-muted-foreground hover:text-yellow-300"
                      )}
                    >
                      <Star className="h-8 w-8 fill-current" />
                    </button>
                  ))}
                  {feedback.rating > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {feedback.rating}/5
                    </Badge>
                  )}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-3">
                <Label className="text-base font-medium text-foreground">
                  What category best describes your feedback?
                </Label>
                <RadioGroup
                  value={feedback.category}
                  onValueChange={handleCategoryChange}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  {feedbackCategories.map((category) => (
                    <div key={category.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={category.value} id={category.value} />
                      <Label htmlFor={category.value} className="text-sm">
                        {category.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Comments */}
              <div className="space-y-3">
                <Label htmlFor="comments" className="text-base font-medium text-foreground">
                  Tell us more about your experience
                </Label>
                <Textarea
                  id="comments"
                  value={feedback.comments}
                  onChange={(e) => handleCommentsChange(e.target.value)}
                  placeholder="What worked well? What could be improved? Any specific issues you encountered?"
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Improvement Suggestions */}
              <div className="space-y-3">
                <Label className="text-base font-medium text-foreground">
                  What improvements would you like to see? (Select all that apply)
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {improvementSuggestions.map((suggestion) => (
                    <div key={suggestion} className="flex items-center space-x-2">
                      <Checkbox
                        id={suggestion}
                        checked={feedback.improvements.includes(suggestion)}
                        onCheckedChange={() => handleImprovementToggle(suggestion)}
                      />
                      <Label htmlFor={suggestion} className="text-sm">
                        {suggestion}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email (Optional) */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-base font-medium text-foreground">
                  Email (Optional)
                  <span className="text-sm text-muted-foreground ml-2">
                    - We'll only use this to follow up on your feedback
                  </span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={feedback.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!isFormValid || isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Feedback
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
