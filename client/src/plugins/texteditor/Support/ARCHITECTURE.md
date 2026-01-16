# System Architecture

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    TEXT EDITOR PLUGIN                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │  UI COMPONENTS  │    │   CORE SERVICES │                    │
│  │                 │    │                 │                    │
│  │ SpellCheckInd.  │◄──►│ ServiceFactory  │                    │
│  │ SpellCheckMgr.  │    │ GrammarCheckSvc │                    │
│  │ AutoSaveManager │    │ SpellCheckSvc   │                    │
│  └─────────────────┘    └─────────────────┘                    │
│           │                       │                            │
│           ▼                       ▼                            │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │ ERROR DISPLAY   │    │  RULE REGISTRY  │                    │
│  │                 │    │                 │                    │
│  │ • Highlighting  │    │ • Rule Loading  │                    │
│  │ • Context Menu  │    │ • Rule Execution│                    │
│  │ • Suggestions   │    │ • Deduplication │                    │
│  └─────────────────┘    └─────────────────┘                    │
│                                   │                            │
│                                   ▼                            │
│           ┌─────────────────────────────────────────┐          │
│           │            GRAMMAR RULES                │          │
│           │                                         │          │
│           │ ┌─────────────┐  ┌─────────────────────┐│          │
│           │ │ ORTHOGRAPHY │  │    AGREEMENT        ││          │
│           │ │             │  │                     ││          │
│           │ │• ProperNames│  │• NounAdjective      ││          │
│           │ │• Shipyashchie│  │• SubjectPredicate   ││          │
│           │ │• SoftSign   │  │                     ││          │
│           │ └─────────────┘  └─────────────────────┘│          │
│           │                                         │          │
│           │ ┌─────────────┐  ┌─────────────────────┐│          │
│           │ │ PUNCTUATION │  │      MORPHOLOGY     ││          │
│           │ │             │  │                     ││          │
│           │ │• Comma Rules│  │• MorphologyAnalyzer ││          │
│           │ │• Dash Rules │  │• Word Classification││          │
│           │ │• Linking    │  │• Gender/Case/Number ││          │
│           │ └─────────────┘  └─────────────────────┘│          │
│           └─────────────────────────────────────────┘          │
│                                   │                            │
│                                   ▼                            │
│           ┌─────────────────────────────────────────┐          │
│           │         SPELL CHECK ENGINE              │          │
│           │                                         │          │
│           │ ┌─────────────┐  ┌─────────────────────┐│          │
│           │ │ DICTIONARY  │  │   TEXT ANALYSIS     ││          │
│           │ │             │  │                     ││          │
│           │ │• Partitioned│  │• Word Extraction    ││          │
│           │ │• Lazy Load  │  │• Error Detection    ││          │
│           │ │• Multi-lang │  │• Suggestion Gen.    ││          │
│           │ └─────────────┘  └─────────────────────┘│          │
│           └─────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

### 🎨 UI Layer

#### SpellCheckIndicator
- **Purpose**: Visual error highlighting and suggestion display
- **Key Features**:
  - Precise word-level highlighting
  - Context menu with suggestions
  - Real-time error visualization
- **Integration**: Receives errors from GrammarCheckService

#### SpellCheckManager
- **Purpose**: User interaction and configuration management
- **Key Features**:
  - Enable/disable spell checking
  - Language selection
  - Dictionary management
- **Integration**: Orchestrates UI components and services

### 🔧 Service Layer

#### ServiceFactory
- **Purpose**: Centralized service instantiation and dependency injection
- **Pattern**: Singleton factory pattern
- **Services Managed**:
  - GrammarCheckService
  - SpellCheckService
  - MorphologyAnalyzer
  - DictionaryLoader

#### GrammarCheckService
- **Purpose**: Main orchestration of grammar checking
- **Key Responsibilities**:
  - Rule execution coordination
  - Error deduplication
  - Combined spell + grammar checking
- **Architecture**: Composition over inheritance

### 📋 Rule System

#### RuleRegistry
- **Purpose**: Dynamic rule loading and management
- **Features**:
  - Lazy rule initialization
  - Rule enabling/disabling
  - Priority-based execution
- **Pattern**: Registry pattern with dependency resolution

#### Grammar Rules
- **Interface**: `GrammarRule`
- **Categories**:
  - **Orthography**: Spelling patterns, proper names
  - **Agreement**: Noun-adjective, subject-predicate
  - **Punctuation**: Comma, dash, linking words
  - **Morphology**: Word structure analysis

### 🔍 Analysis Layer

#### MorphologyAnalyzer
- **Purpose**: Word structure and grammatical property analysis
- **Capabilities**:
  - Part of speech identification
  - Gender, number, case detection
  - Pattern-based classification
- **Approach**: Algorithmic analysis with known word dictionary

#### SpellCheckEngine
- **Purpose**: Dictionary-based spell checking
- **Features**:
  - Partitioned dictionary loading
  - Multi-language support
  - Suggestion generation
- **Optimization**: Lazy loading, caching

## Data Flow

```
Text Input
    │
    ▼
┌─────────────────┐
│ Text Processing │
│ • Tokenization  │
│ • Normalization │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Parallel Check  │
│ • Spell Check   │
│ • Grammar Rules │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Error Merging   │
│ • Deduplication │
│ • Prioritization│
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ UI Rendering    │
│ • Highlighting  │
│ • Suggestions   │
└─────────────────┘
```

## Key Design Patterns

### 1. **Strategy Pattern** (Grammar Rules)
- Each rule implements `GrammarRule` interface
- Rules are interchangeable and configurable
- Easy to add new rules without modifying existing code

### 2. **Factory Pattern** (ServiceFactory)
- Centralized service creation
- Dependency injection
- Lazy initialization

### 3. **Observer Pattern** (Error Notifications)
- UI components observe service changes
- Real-time error updates
- Decoupled architecture

### 4. **Registry Pattern** (RuleRegistry)
- Dynamic rule registration
- Rule discovery and loading
- Dependency resolution

## Performance Considerations

### Optimization Strategies
1. **Lazy Loading**: Rules and dictionaries load on demand
2. **Caching**: Morphology analysis results cached
3. **Debouncing**: Text checking debounced to prevent excessive calls
4. **Partitioned Dictionaries**: Only load relevant dictionary sections
5. **Error Deduplication**: Prevent duplicate error reporting

### Memory Management
- Weak references for event listeners
- Cleanup methods in all services
- Efficient regex compilation and reuse

## Scalability Features

### Rule System
- **Modular**: Each rule is independent
- **Extensible**: Easy to add new rule types
- **Configurable**: Rules can be enabled/disabled
- **Prioritized**: Rule execution order management

### Language Support
- **Multi-language**: Support for multiple languages
- **Algorithmic**: Pattern-based approach scales to new languages
- **Localized**: Language-specific rule implementations