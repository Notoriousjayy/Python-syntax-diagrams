# Python Syntax Diagrams

Interactive railroad diagrams (syntax diagrams) for Python, based on the official PEG grammar from CPython.

## Overview

This project provides a visual representation of Python's grammar using railroad diagrams. These diagrams make it easier to understand the syntax structure of Python by providing a graphical alternative to PEG/BNF notation.

The grammar rules are organized into 21 sections:

- **Starting Rules** - Entry points for parsing (file, interactive, eval)
- **General Statements** - Statement structure
- **Simple Statements** - Assignment, return, raise, pass, break, continue, etc.
- **Import Statements** - import and from...import
- **Compound Statements** - Block structure, decorators, class/function definitions
- **Function Parameters** - Parameter definitions with defaults, annotations
- **Control Flow** - if/elif/else, while, for, with, try/except/finally
- **Pattern Matching** - match/case statements (PEP 634)
- **Type Statements** - Type aliases and type parameters (PEP 695)
- **Expressions** - Expression structure, yield, star expressions, walrus operator
- **Comparison Operators** - ==, !=, <, >, <=, >=, is, in, not in
- **Bitwise Operators** - |, ^, &, <<, >>
- **Arithmetic Operators** - +, -, *, /, //, %, @, **
- **Primary Elements** - Atoms, attribute access, subscripts, calls
- **Lambda Functions** - Lambda parameter handling
- **Literals** - f-strings, t-strings, strings
- **Collections** - Lists, tuples, sets, dicts
- **Comprehensions & Generators** - List/set/dict comprehensions, generator expressions
- **Function Call Arguments** - Positional, keyword, *args, **kwargs
- **Assignment Targets** - Star targets, subscript/attribute targets
- **Typing Elements** - Type expressions for annotations

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5176`.

### Production Build

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Type Checking

```bash
npm run typecheck
```

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Webpack 5** - Bundling
- **@prantlf/railroad-diagrams** - Railroad diagram generation

## Project Structure

```
python-syntax-diagrams/
├── src/
│   ├── main.tsx                          # Entry point
│   ├── app/
│   │   ├── App.tsx                       # Main application component
│   │   └── styles.css                    # Global styles
│   ├── components/
│   │   ├── RuleDiagram.tsx               # Individual rule diagram
│   │   └── RuleList.tsx                  # List of rule diagrams
│   ├── features/
│   │   └── grammar/
│   │       └── pythonGrammar.ts          # Python grammar definitions
│   ├── shared/
│   │   └── railroad/
│   │       └── diagramToSvg.ts           # SVG rendering utility
│   └── types/
│       └── railroad-diagrams.d.ts        # Type declarations
├── .github/
│   ├── dependabot.yml
│   └── workflows/
│       ├── codeql.yml
│       ├── dependency-review.yml
│       └── pages.yml
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.webpack.json
└── webpack.config.cjs
```

## Grammar Coverage

This project covers the complete Python PEG grammar including:

- **Statements**: Simple and compound statements
- **Expressions**: Full expression hierarchy with operator precedence
- **Pattern Matching**: Complete match/case support (Python 3.10+)
- **Type Features**: Type aliases, type parameters (Python 3.12+)
- **String Literals**: f-strings, t-strings with format specs
- **Comprehensions**: List, set, dict comprehensions and generator expressions
- **Function Definitions**: Parameters, annotations, decorators, async
- **Class Definitions**: Inheritance, type parameters, decorators

## References

- [Python Grammar Specification](https://docs.python.org/3/reference/grammar.html)
- [PEP 617 – New Parser](https://peps.python.org/pep-0617/)
- [PEP 634 – Structural Pattern Matching](https://peps.python.org/pep-0634/)
- [PEP 695 – Type Parameter Syntax](https://peps.python.org/pep-0695/)
- [CPython Grammar/python.gram](https://github.com/python/cpython/blob/main/Grammar/python.gram)
- [Railroad Diagram (Wikipedia)](https://en.wikipedia.org/wiki/Syntax_diagram)

## License

MIT
