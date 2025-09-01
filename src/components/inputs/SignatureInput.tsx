import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TextInput } from "./TextInput";
import { cn } from "@/lib/utils";

interface SignatureInputProps {
  id: string;
  customerName: string;
  onCustomerNameChange: (name: string) => void;
  onPermissionGranted: (granted: boolean) => void;
  permissionGranted: boolean;
  required?: boolean;
  isFlagged?: boolean;
  flagMessage?: string;
}

export function SignatureInput({
  id,
  customerName,
  onCustomerNameChange,
  onPermissionGranted,
  permissionGranted,
  required = false,
  isFlagged = false,
  flagMessage
}: SignatureInputProps) {
  return (
    <div className={cn("space-y-4 p-4 border rounded-lg bg-muted/20", isFlagged && "flag-indicator border-destructive")}>
      <div className="space-y-3">
        <Label className="text-base font-medium text-foreground">
          Customer Permission for DNO Contact
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        
        <div className="text-sm text-muted-foreground space-y-2">
          <p>I, <strong>{customerName || "[CUSTOMER NAME]"}</strong>, hereby give permission to contact the Distribution Network Operator (DNO) on my behalf to:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Attain necessary documents and approvals</li>
            <li>Request technical information about my electrical connection</li>
            <li>Apply for grid connection upgrades if required</li>
            <li>Communicate regarding my solar installation project</li>
          </ul>
        </div>
        
        <div className="space-y-3">
          <TextInput
            id={`${id}-customer-name`}
            label="Customer Full Name"
            value={customerName}
            onChange={onCustomerNameChange}
            placeholder="Enter customer's full name..."
            required
          />
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`${id}-permission`}
              checked={permissionGranted}
              onCheckedChange={onPermissionGranted}
              className={cn(
                isFlagged && "border-destructive focus:ring-destructive/50"
              )}
            />
            <Label 
              htmlFor={`${id}-permission`} 
              className="text-sm font-medium text-foreground cursor-pointer"
            >
              I confirm that I give permission for the above actions
            </Label>
          </div>
        </div>
      </div>
      
      {isFlagged && flagMessage && (
        <div className="flex items-center space-x-2 text-base text-destructive">
          <span>⚠</span>
          <span>{flagMessage}</span>
          <button className="underline hover:no-underline">
            Click to resolve
          </button>
        </div>
      )}
    </div>
  );
}

