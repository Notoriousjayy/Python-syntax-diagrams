# Python 3.14 Syntax Diagrams

A React + TypeScript single-page app that renders **Python 3.14 grammar railroad diagrams** (SVG) and shows each rule's **EBNF text** underneath. The grammar is implemented as "diagram factories" that produce railroad-diagram objects.

## Features

- **Railroad Diagrams**: Visual representation of Python 3.14 grammar rules using SVG
- **EBNF Definitions**: Collapsible EBNF notation below each diagram
- **Section Navigation**: Grammar rules organized by category (Statements, Expressions, Pattern Matching, etc.)
- **Search/Filter**: Filter rules by name
- **Dark Mode**: Automatic dark mode support
- **Lazy Rendering**: Sections are collapsed by default for performance with large grammar sets

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run typecheck

# Check grammar coverage (diagram ↔ EBNF sync)
npm run check-grammar
```

## Project Structure

```
├── src/
│   ├── main.tsx                    # Entry point
│   ├── app/
│   │   ├── App.tsx                 # Main application component
│   │   └── styles.css              # Global styles
│   ├── components/
│   │   ├── RuleDiagram.tsx         # Individual rule diagram renderer
│   │   └── RuleList.tsx            # List of rule diagrams
│   ├── features/
│   │   └── grammar/
│   │       ├── pythonGrammar.ts    # Diagram factories & section definitions
│   │       └── ebnfDefinitions.ts  # EBNF text definitions
│   ├── shared/
│   │   └── railroad/
│   │       └── diagramToSvg.ts     # SVG conversion utility
│   └── types/
│       └── railroad-diagrams.d.ts  # Type declarations
├── scripts/
│   └── check-grammar-coverage.mjs  # Grammar/EBNF drift detection
├── .github/
│   ├── workflows/
│   │   ├── pages.yml               # GitHub Pages deployment
│   │   ├── ci.yml                  # CI pipeline with typecheck
│   │   ├── codeql.yml              # Security scanning
│   │   └── dependency-review.yml   # Dependency vulnerability review
│   └── dependabot.yml              # Automated dependency updates
└── webpack.config.cjs              # Webpack configuration
```

## Grammar Coverage

This project covers the complete Python 3.14 PEG grammar organized into 21 sections:

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

## CI/CD

The project uses GitHub Actions for:

1. **Type Safety**: `npm run typecheck` runs before every build
2. **Grammar Coverage**: `npm run check-grammar` ensures diagram factories and EBNF definitions stay in sync
3. **Security Scanning**: CodeQL analysis on push/PR and weekly schedule
4. **Dependency Review**: Checks PRs for vulnerable dependencies
5. **Automated Deployment**: GitHub Pages deployment on push to main

## Development Notes

### Adding New Grammar Rules

1. Add the diagram factory in `src/features/grammar/pythonGrammar.ts`:
   ```typescript
   rules.set("my-new-rule", () =>
     Diagram(
       Sequence(K("keyword"), NT("identifier"))
     )
   );
   ```

2. Add the EBNF definition in `src/features/grammar/ebnfDefinitions.ts`:
   ```typescript
   "my-new-rule": `my-new-rule:
       'keyword' identifier`,
   ```

3. Add the rule to the appropriate section in `SECTION_RULES`

4. Run `npm run check-grammar` to verify coverage

### SVG Trust Boundary

The `RuleDiagram` component uses `dangerouslySetInnerHTML` to render SVG. This is safe because:
- SVG is generated locally from deterministic factories
- No untrusted user input is processed
- If external grammar loading is added in the future, implement defensive sanitization

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Webpack 5** - Bundling
- **@prantlf/railroad-diagrams** - Railroad diagram generation

## References

- [Python Grammar Specification](https://docs.python.org/3/reference/grammar.html)
- [PEP 617 – New Parser](https://peps.python.org/pep-0617/)
- [PEP 634 – Structural Pattern Matching](https://peps.python.org/pep-0634/)
- [PEP 695 – Type Parameter Syntax](https://peps.python.org/pep-0695/)
- [CPython Grammar/python.gram](https://github.com/python/cpython/blob/main/Grammar/python.gram)
- [Railroad Diagram (Wikipedia)](https://en.wikipedia.org/wiki/Syntax_diagram)

## License

MIT
