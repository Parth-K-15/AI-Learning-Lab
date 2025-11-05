import React, { useState } from 'react';

const pythonCode = `# Python program to illustrate Missionaries & Cannibals Problem
# This code is contributed by Sunit Mal

print("\\n")
print("\\tGame Start\\nNow the task is to move all of them to right side of the river")
print("rules:\\n1. The boat can carry at most two people\\n2. If cannibals num greater than missionaries then the cannibals would eat the missionaries\\n3. The boat cannot cross the river by itself with no people on board")

lM = 3  # lM = Left side Missionaries number
lC = 3  # lC = Left side Cannibals number
rM = 0  # rM = Right side Missionaries number
rC = 0  # rC = Right side cannibals number
userM = 0  # userM = User input for number of missionaries for right to left side travel
userC = 0  # userC = User input for number of cannibals for right to left travel
k = 0

print("\\nM M M C C C |     --- | \\n")

try:
    while(True):
        while(True):
            print("Left side -> right side river travel")
            # uM = user input for number of missionaries for left to right travel
            # uC = user input for number of cannibals for left to right travel
            uM = int(input("Enter number of Missionaries travel => "))
            uC = int(input("Enter number of Cannibals travel => "))

            if((uM == 0) and (uC == 0)):
                print("Empty travel not possible")
                print("Re-enter : ")
            elif(((uM + uC) <= 2) and ((lM - uM) >= 0) and ((lC - uC) >= 0)):
                break
            else:
                print("Wrong input re-enter : ")
                
        lM = (lM - uM)
        lC = (lC - uC)
        rM += uM
        rC += uC

        print("\\n")
        for i in range(0, lM):
            print("M ", end="")
        for i in range(0, lC):
            print("C ", end="")
        print("| --> | ", end="")
        for i in range(0, rM):
            print("M ", end="")
        for i in range(0, rC):
            print("C ", end="")
        print("\\n")

        k += 1

        if(((lC == 3) and (lM == 1)) or ((lC == 3) and (lM == 2)) or 
           ((lC == 2) and (lM == 1)) or ((rC == 3) and (rM == 1)) or 
           ((rC == 3) and (rM == 2)) or ((rC == 2) and (rM == 1))):
            print("Cannibals eat missionaries:\\nYou lost the game")
            break

        if((rM + rC) == 6):
            print("You won the game : \\n\\tCongrats")
            print("Total attempt")
            print(k)
            break
            
        while(True):
            print("Right side -> Left side river travel")
            userM = int(input("Enter number of Missionaries travel => "))
            userC = int(input("Enter number of Cannibals travel => "))

            if((userM == 0) and (userC == 0)):
                print("Empty travel not possible")
                print("Re-enter : ")
            elif(((userM + userC) <= 2) and ((rM - userM) >= 0) and ((rC - userC) >= 0)):
                break
            else:
                print("Wrong input re-enter : ")
                
        lM += userM
        lC += userC
        rM -= userM
        rC -= userC

        k += 1
        
        print("\\n")
        for i in range(0, lM):
            print("M ", end="")
        for i in range(0, lC):
            print("C ", end="")
        print("| <-- | ", end="")
        for i in range(0, rM):
            print("M ", end="")
        for i in range(0, rC):
            print("C ", end="")
        print("\\n")

        if(((lC == 3) and (lM == 1)) or ((lC == 3) and (lM == 2)) or 
           ((lC == 2) and (lM == 1)) or ((rC == 3) and (rM == 1)) or 
           ((rC == 3) and (rM == 2)) or ((rC == 2) and (rM == 1))):
            print("Cannibals eat missionaries:\\nYou lost the game")
            break
            
except EOFError as e:
    print("\\nInvalid input please retry !!")
`;

const cppCode = `// C++ program to illustrate Missionaries & Cannibals Problem
// Converted from Python implementation

#include <iostream>
using namespace std;

int main() {
    int lM = 3;  // lM = Left side Missionaries number
    int lC = 3;  // lC = Left side Cannibals number
    int rM = 0;  // rM = Right side Missionaries number
    int rC = 0;  // rC = Right side cannibals number
    int userM = 0;  // userM = User input for number of missionaries for right to left side travel
    int userC = 0;  // userC = User input for number of cannibals for right to left travel
    int k = 0;
    int uM, uC;

    cout << "\\n";
    cout << "\\tGame Start\\nNow the task is to move all of them to right side of the river" << endl;
    cout << "rules:\\n1. The boat can carry at most two people\\n2. If cannibals num greater than missionaries then the cannibals would eat the missionaries\\n3. The boat cannot cross the river by itself with no people on board" << endl;
    cout << "\\nM M M C C C |     --- | \\n" << endl;

    try {
        while(true) {
            // Left to Right travel
            while(true) {
                cout << "Left side -> right side river travel" << endl;
                cout << "Enter number of Missionaries travel => ";
                cin >> uM;
                cout << "Enter number of Cannibals travel => ";
                cin >> uC;

                if((uM == 0) && (uC == 0)) {
                    cout << "Empty travel not possible" << endl;
                    cout << "Re-enter : " << endl;
                }
                else if(((uM + uC) <= 2) && ((lM - uM) >= 0) && ((lC - uC) >= 0)) {
                    break;
                }
                else {
                    cout << "Wrong input re-enter : " << endl;
                }
            }

            lM = lM - uM;
            lC = lC - uC;
            rM += uM;
            rC += uC;

            cout << "\\n";
            for(int i = 0; i < lM; i++) {
                cout << "M ";
            }
            for(int i = 0; i < lC; i++) {
                cout << "C ";
            }
            cout << "| --> | ";
            for(int i = 0; i < rM; i++) {
                cout << "M ";
            }
            for(int i = 0; i < rC; i++) {
                cout << "C ";
            }
            cout << "\\n" << endl;

            k++;

            // Check lose condition
            if(((lC == 3) && (lM == 1)) || ((lC == 3) && (lM == 2)) || 
               ((lC == 2) && (lM == 1)) || ((rC == 3) && (rM == 1)) || 
               ((rC == 3) && (rM == 2)) || ((rC == 2) && (rM == 1))) {
                cout << "Cannibals eat missionaries:\\nYou lost the game" << endl;
                break;
            }

            // Check win condition
            if((rM + rC) == 6) {
                cout << "You won the game : \\n\\tCongrats" << endl;
                cout << "Total attempt: " << k << endl;
                break;
            }

            // Right to Left travel
            while(true) {
                cout << "Right side -> Left side river travel" << endl;
                cout << "Enter number of Missionaries travel => ";
                cin >> userM;
                cout << "Enter number of Cannibals travel => ";
                cin >> userC;

                if((userM == 0) && (userC == 0)) {
                    cout << "Empty travel not possible" << endl;
                    cout << "Re-enter : " << endl;
                }
                else if(((userM + userC) <= 2) && ((rM - userM) >= 0) && ((rC - userC) >= 0)) {
                    break;
                }
                else {
                    cout << "Wrong input re-enter : " << endl;
                }
            }

            lM += userM;
            lC += userC;
            rM -= userM;
            rC -= userC;

            k++;

            cout << "\\n";
            for(int i = 0; i < lM; i++) {
                cout << "M ";
            }
            for(int i = 0; i < lC; i++) {
                cout << "C ";
            }
            cout << "| <-- | ";
            for(int i = 0; i < rM; i++) {
                cout << "M ";
            }
            for(int i = 0; i < rC; i++) {
                cout << "C ";
            }
            cout << "\\n" << endl;

            // Check lose condition after return trip
            if(((lC == 3) && (lM == 1)) || ((lC == 3) && (lM == 2)) || 
               ((lC == 2) && (lM == 1)) || ((rC == 3) && (rM == 1)) || 
               ((rC == 3) && (rM == 2)) || ((rC == 2) && (rM == 1))) {
                cout << "Cannibals eat missionaries:\\nYou lost the game" << endl;
                break;
            }
        }
    }
    catch(...) {
        cout << "\\nInvalid input please retry !!" << endl;
    }

    return 0;
}
`;

export default function CodeViewer({ isOpen, onClose, pyCode, cppCode, baseName }) {
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [copySuccess, setCopySuccess] = useState('');

  if (!isOpen) return null;

  const currentCode = selectedLanguage === 'python' ? (pyCode || pythonCode) : (cppCode || cppCode);
  const fileExtension = selectedLanguage === 'python' ? 'py' : 'cpp';
  const fileName = `${baseName || 'missionaries_cannibals'}.${fileExtension}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopySuccess('✓ Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      setCopySuccess('Failed to copy');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([currentCode], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border-2 border-indigo-500 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-indigo-400 flex items-center gap-2">
              💻 Console Implementation Code
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Language Selector */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedLanguage('python')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                selectedLanguage === 'python'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              🐍 Python
            </button>
            <button
              onClick={() => setSelectedLanguage('cpp')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                selectedLanguage === 'cpp'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              ⚙️ C++
            </button>
          </div>
        </div>

        {/* Code Display */}
        <div className="flex-1 overflow-auto px-6 py-4">
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <pre className="text-sm text-gray-300 font-mono overflow-x-auto">
              <code>{currentCode}</code>
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-700 flex items-center justify-between">
          <div className="text-gray-400 text-sm">
            <span className="font-semibold text-indigo-400">{fileName}</span>
            {' '} - Console-based implementation
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              {copySuccess || '📋 Copy Code'}
            </button>
            <button
              onClick={handleDownload}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              ⬇️ Download {fileExtension.toUpperCase()}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
