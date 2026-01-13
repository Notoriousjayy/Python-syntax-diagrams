// python-syntax-diagrams.ts
//
// ES module that defines the Python grammar as railroad diagrams.
// Based on the Python PEG grammar (Grammar/python.gram) from CPython.
// Many rules are rendered in diagram-friendly equivalent form.

import * as RR from "@prantlf/railroad-diagrams/lib/index.mjs";

// Convenience wrappers
function callOrNew(Ctor: any, ...args: any[]): any {
  try {
    return Ctor(...args);
  } catch (e: any) {
    if (e instanceof TypeError && /without 'new'/.test(e.message)) {
      return new Ctor(...args);
    }
    throw e;
  }
}

// Wrapped primitives
const Diagram    = (...a: any[]) => callOrNew(RR.Diagram, ...a);
const Sequence   = (...a: any[]) => callOrNew(RR.Sequence, ...a);
const Choice     = (...a: any[]) => callOrNew(RR.Choice, ...a);
const Optional   = (...a: any[]) => callOrNew(RR.Optional, ...a);
const OneOrMore  = (...a: any[]) => callOrNew(RR.OneOrMore, ...a);
const ZeroOrMore = (...a: any[]) => callOrNew(RR.ZeroOrMore, ...a);
const Terminal   = (...a: any[]) => callOrNew(RR.Terminal, ...a);
const NonTerminal = (...a: any[]) => callOrNew(RR.NonTerminal, ...a);
const Stack      = (...a: any[]) => callOrNew(RR.Stack, ...a);
const Comment    = (...a: any[]) => callOrNew(RR.Comment, ...a);

const T  = (s: string) => Terminal(s);
const NT = (s: string) => NonTerminal(s);
const K  = (s: string) => Terminal(s); // Keyword (single quotes in PEG)
const SK = (s: string) => Terminal(s); // Soft keyword (double quotes in PEG)

// --- Grammar rules (diagram factories) ----------------------------------------

const rules = new Map<string, () => any>();

// ===== STARTING RULES =====

rules.set("file", () =>
  Diagram(
    Sequence(Optional(NT("statements")), T("ENDMARKER"))
  )
);

rules.set("interactive", () =>
  Diagram(NT("statement_newline"))
);

rules.set("eval", () =>
  Diagram(
    Sequence(NT("expressions"), ZeroOrMore(T("NEWLINE")), T("ENDMARKER"))
  )
);

rules.set("func_type", () =>
  Diagram(
    Sequence(
      T("("),
      Optional(NT("type_expressions")),
      T(")"),
      T("->"),
      NT("expression"),
      ZeroOrMore(T("NEWLINE")),
      T("ENDMARKER")
    )
  )
);

// ===== GENERAL STATEMENTS =====

rules.set("statements", () =>
  Diagram(OneOrMore(NT("statement")))
);

rules.set("statement", () =>
  Diagram(
    Choice(0,
      NT("compound_stmt"),
      NT("simple_stmts")
    )
  )
);

rules.set("statement_newline", () =>
  Diagram(
    Choice(0,
      Sequence(NT("compound_stmt"), T("NEWLINE")),
      NT("simple_stmts"),
      T("NEWLINE"),
      T("ENDMARKER")
    )
  )
);

rules.set("simple_stmts", () =>
  Diagram(
    Choice(0,
      Sequence(NT("simple_stmt"), T("NEWLINE")),
      Sequence(
        NT("simple_stmt"),
        ZeroOrMore(Sequence(T(";"), NT("simple_stmt"))),
        Optional(T(";")),
        T("NEWLINE")
      )
    )
  )
);

rules.set("simple_stmt", () =>
  Diagram(
    Choice(0,
      NT("assignment"),
      NT("type_alias"),
      NT("star_expressions"),
      NT("return_stmt"),
      NT("import_stmt"),
      NT("raise_stmt"),
      NT("pass_stmt"),
      NT("del_stmt"),
      NT("yield_stmt"),
      NT("assert_stmt"),
      NT("break_stmt"),
      NT("continue_stmt"),
      NT("global_stmt"),
      NT("nonlocal_stmt")
    )
  )
);

rules.set("compound_stmt", () =>
  Diagram(
    Choice(0,
      NT("function_def"),
      NT("if_stmt"),
      NT("class_def"),
      NT("with_stmt"),
      NT("for_stmt"),
      NT("try_stmt"),
      NT("while_stmt"),
      NT("match_stmt")
    )
  )
);

// ===== SIMPLE STATEMENTS =====

rules.set("assignment", () =>
  Diagram(
    Choice(0,
      Sequence(T("NAME"), T(":"), NT("expression"), Optional(Sequence(T("="), NT("annotated_rhs")))),
      Sequence(
        Choice(0,
          Sequence(T("("), NT("single_target"), T(")")),
          NT("single_subscript_attribute_target")
        ),
        T(":"),
        NT("expression"),
        Optional(Sequence(T("="), NT("annotated_rhs")))
      ),
      Sequence(
        OneOrMore(Sequence(NT("star_targets"), T("="))),
        NT("annotated_rhs"),
        Optional(T("TYPE_COMMENT"))
      ),
      Sequence(NT("single_target"), NT("augassign"), NT("annotated_rhs"))
    )
  )
);

rules.set("annotated_rhs", () =>
  Diagram(
    Choice(0, NT("yield_expr"), NT("star_expressions"))
  )
);

rules.set("augassign", () =>
  Diagram(
    Choice(0,
      T("+="), T("-="), T("*="), T("@="), T("/="), T("%="),
      T("&="), T("|="), T("^="), T("<<="), T(">>="), T("**="), T("//=")
    )
  )
);

rules.set("return_stmt", () =>
  Diagram(
    Sequence(K("return"), Optional(NT("star_expressions")))
  )
);

rules.set("raise_stmt", () =>
  Diagram(
    Choice(0,
      Sequence(K("raise"), NT("expression"), Optional(Sequence(K("from"), NT("expression")))),
      K("raise")
    )
  )
);

rules.set("pass_stmt", () =>
  Diagram(K("pass"))
);

rules.set("break_stmt", () =>
  Diagram(K("break"))
);

rules.set("continue_stmt", () =>
  Diagram(K("continue"))
);

rules.set("global_stmt", () =>
  Diagram(
    Sequence(
      K("global"),
      T("NAME"),
      ZeroOrMore(Sequence(T(","), T("NAME")))
    )
  )
);

rules.set("nonlocal_stmt", () =>
  Diagram(
    Sequence(
      K("nonlocal"),
      T("NAME"),
      ZeroOrMore(Sequence(T(","), T("NAME")))
    )
  )
);

rules.set("del_stmt", () =>
  Diagram(
    Sequence(K("del"), NT("del_targets"))
  )
);

rules.set("yield_stmt", () =>
  Diagram(NT("yield_expr"))
);

rules.set("assert_stmt", () =>
  Diagram(
    Sequence(
      K("assert"),
      NT("expression"),
      Optional(Sequence(T(","), NT("expression")))
    )
  )
);

// ===== IMPORT STATEMENTS =====

rules.set("import_stmt", () =>
  Diagram(
    Choice(0, NT("import_name"), NT("import_from"))
  )
);

rules.set("import_name", () =>
  Diagram(
    Sequence(K("import"), NT("dotted_as_names"))
  )
);

rules.set("import_from", () =>
  Diagram(
    Choice(0,
      Sequence(
        K("from"),
        ZeroOrMore(Choice(0, T("."), T("..."))),
        NT("dotted_name"),
        K("import"),
        NT("import_from_targets")
      ),
      Sequence(
        K("from"),
        OneOrMore(Choice(0, T("."), T("..."))),
        K("import"),
        NT("import_from_targets")
      )
    )
  )
);

rules.set("import_from_targets", () =>
  Diagram(
    Choice(0,
      Sequence(T("("), NT("import_from_as_names"), Optional(T(",")), T(")")),
      NT("import_from_as_names"),
      T("*")
    )
  )
);

rules.set("import_from_as_names", () =>
  Diagram(
    Sequence(
      NT("import_from_as_name"),
      ZeroOrMore(Sequence(T(","), NT("import_from_as_name")))
    )
  )
);

rules.set("import_from_as_name", () =>
  Diagram(
    Sequence(T("NAME"), Optional(Sequence(K("as"), T("NAME"))))
  )
);

rules.set("dotted_as_names", () =>
  Diagram(
    Sequence(
      NT("dotted_as_name"),
      ZeroOrMore(Sequence(T(","), NT("dotted_as_name")))
    )
  )
);

rules.set("dotted_as_name", () =>
  Diagram(
    Sequence(NT("dotted_name"), Optional(Sequence(K("as"), T("NAME"))))
  )
);

rules.set("dotted_name", () =>
  Diagram(
    Sequence(
      T("NAME"),
      ZeroOrMore(Sequence(T("."), T("NAME")))
    )
  )
);

// ===== COMPOUND STATEMENTS - Common Elements =====

rules.set("block", () =>
  Diagram(
    Choice(0,
      Sequence(T("NEWLINE"), T("INDENT"), NT("statements"), T("DEDENT")),
      NT("simple_stmts")
    )
  )
);

rules.set("decorators", () =>
  Diagram(
    OneOrMore(Sequence(T("@"), NT("named_expression"), T("NEWLINE")))
  )
);

// ===== CLASS DEFINITIONS =====

rules.set("class_def", () =>
  Diagram(
    Choice(0,
      Sequence(NT("decorators"), NT("class_def_raw")),
      NT("class_def_raw")
    )
  )
);

rules.set("class_def_raw", () =>
  Diagram(
    Sequence(
      K("class"),
      T("NAME"),
      Optional(NT("type_params")),
      Optional(Sequence(T("("), Optional(NT("arguments")), T(")"))),
      T(":"),
      NT("block")
    )
  )
);

// ===== FUNCTION DEFINITIONS =====

rules.set("function_def", () =>
  Diagram(
    Choice(0,
      Sequence(NT("decorators"), NT("function_def_raw")),
      NT("function_def_raw")
    )
  )
);

rules.set("function_def_raw", () =>
  Diagram(
    Choice(0,
      Sequence(
        K("def"),
        T("NAME"),
        Optional(NT("type_params")),
        T("("),
        Optional(NT("params")),
        T(")"),
        Optional(Sequence(T("->"), NT("expression"))),
        T(":"),
        Optional(NT("func_type_comment")),
        NT("block")
      ),
      Sequence(
        K("async"),
        K("def"),
        T("NAME"),
        Optional(NT("type_params")),
        T("("),
        Optional(NT("params")),
        T(")"),
        Optional(Sequence(T("->"), NT("expression"))),
        T(":"),
        Optional(NT("func_type_comment")),
        NT("block")
      )
    )
  )
);

// ===== FUNCTION PARAMETERS =====

rules.set("params", () =>
  Diagram(NT("parameters"))
);

rules.set("parameters", () =>
  Diagram(
    Choice(0,
      Sequence(NT("slash_no_default"), ZeroOrMore(NT("param_no_default")), ZeroOrMore(NT("param_with_default")), Optional(NT("star_etc"))),
      Sequence(NT("slash_with_default"), ZeroOrMore(NT("param_with_default")), Optional(NT("star_etc"))),
      Sequence(OneOrMore(NT("param_no_default")), ZeroOrMore(NT("param_with_default")), Optional(NT("star_etc"))),
      Sequence(OneOrMore(NT("param_with_default")), Optional(NT("star_etc"))),
      NT("star_etc")
    )
  )
);

rules.set("slash_no_default", () =>
  Diagram(
    Sequence(OneOrMore(NT("param_no_default")), T("/"), Choice(0, T(","), Comment("&')'") ))
  )
);

rules.set("slash_with_default", () =>
  Diagram(
    Sequence(
      ZeroOrMore(NT("param_no_default")),
      OneOrMore(NT("param_with_default")),
      T("/"),
      Choice(0, T(","), Comment("&')'"))
    )
  )
);

rules.set("star_etc", () =>
  Diagram(
    Choice(0,
      Sequence(T("*"), NT("param_no_default"), ZeroOrMore(NT("param_maybe_default")), Optional(NT("kwds"))),
      Sequence(T("*"), NT("param_no_default_star_annotation"), ZeroOrMore(NT("param_maybe_default")), Optional(NT("kwds"))),
      Sequence(T("*"), T(","), OneOrMore(NT("param_maybe_default")), Optional(NT("kwds"))),
      NT("kwds")
    )
  )
);

rules.set("kwds", () =>
  Diagram(Sequence(T("**"), NT("param_no_default")))
);

rules.set("param_no_default", () =>
  Diagram(
    Sequence(NT("param"), Choice(0, Sequence(T(","), Optional(T("TYPE_COMMENT"))), Sequence(Optional(T("TYPE_COMMENT")), Comment("&')'"))))
  )
);

rules.set("param_no_default_star_annotation", () =>
  Diagram(
    Sequence(NT("param_star_annotation"), Choice(0, Sequence(T(","), Optional(T("TYPE_COMMENT"))), Sequence(Optional(T("TYPE_COMMENT")), Comment("&')'"))))
  )
);

rules.set("param_with_default", () =>
  Diagram(
    Sequence(NT("param"), NT("default"), Choice(0, Sequence(T(","), Optional(T("TYPE_COMMENT"))), Sequence(Optional(T("TYPE_COMMENT")), Comment("&')'"))))
  )
);

rules.set("param_maybe_default", () =>
  Diagram(
    Sequence(NT("param"), Optional(NT("default")), Choice(0, Sequence(T(","), Optional(T("TYPE_COMMENT"))), Sequence(Optional(T("TYPE_COMMENT")), Comment("&')'"))))
  )
);

rules.set("param", () =>
  Diagram(Sequence(T("NAME"), Optional(NT("annotation"))))
);

rules.set("param_star_annotation", () =>
  Diagram(Sequence(T("NAME"), NT("star_annotation")))
);

rules.set("annotation", () =>
  Diagram(Sequence(T(":"), NT("expression")))
);

rules.set("star_annotation", () =>
  Diagram(Sequence(T(":"), NT("star_expression")))
);

rules.set("default", () =>
  Diagram(Sequence(T("="), NT("expression")))
);

// ===== IF STATEMENT =====

rules.set("if_stmt", () =>
  Diagram(
    Choice(0,
      Sequence(K("if"), NT("named_expression"), T(":"), NT("block"), NT("elif_stmt")),
      Sequence(K("if"), NT("named_expression"), T(":"), NT("block"), Optional(NT("else_block")))
    )
  )
);

rules.set("elif_stmt", () =>
  Diagram(
    Choice(0,
      Sequence(K("elif"), NT("named_expression"), T(":"), NT("block"), NT("elif_stmt")),
      Sequence(K("elif"), NT("named_expression"), T(":"), NT("block"), Optional(NT("else_block")))
    )
  )
);

rules.set("else_block", () =>
  Diagram(Sequence(K("else"), T(":"), NT("block")))
);

// ===== WHILE STATEMENT =====

rules.set("while_stmt", () =>
  Diagram(
    Sequence(K("while"), NT("named_expression"), T(":"), NT("block"), Optional(NT("else_block")))
  )
);

// ===== FOR STATEMENT =====

rules.set("for_stmt", () =>
  Diagram(
    Choice(0,
      Sequence(K("for"), NT("star_targets"), K("in"), NT("star_expressions"), T(":"), Optional(T("TYPE_COMMENT")), NT("block"), Optional(NT("else_block"))),
      Sequence(K("async"), K("for"), NT("star_targets"), K("in"), NT("star_expressions"), T(":"), Optional(T("TYPE_COMMENT")), NT("block"), Optional(NT("else_block")))
    )
  )
);

// ===== WITH STATEMENT =====

rules.set("with_stmt", () =>
  Diagram(
    Choice(0,
      Sequence(K("with"), T("("), NT("with_item"), ZeroOrMore(Sequence(T(","), NT("with_item"))), Optional(T(",")), T(")"), T(":"), Optional(T("TYPE_COMMENT")), NT("block")),
      Sequence(K("with"), NT("with_item"), ZeroOrMore(Sequence(T(","), NT("with_item"))), T(":"), Optional(T("TYPE_COMMENT")), NT("block")),
      Sequence(K("async"), K("with"), T("("), NT("with_item"), ZeroOrMore(Sequence(T(","), NT("with_item"))), Optional(T(",")), T(")"), T(":"), NT("block")),
      Sequence(K("async"), K("with"), NT("with_item"), ZeroOrMore(Sequence(T(","), NT("with_item"))), T(":"), Optional(T("TYPE_COMMENT")), NT("block"))
    )
  )
);

rules.set("with_item", () =>
  Diagram(
    Choice(0,
      Sequence(NT("expression"), K("as"), NT("star_target")),
      NT("expression")
    )
  )
);

// ===== TRY STATEMENT =====

rules.set("try_stmt", () =>
  Diagram(
    Choice(0,
      Sequence(K("try"), T(":"), NT("block"), NT("finally_block")),
      Sequence(K("try"), T(":"), NT("block"), OneOrMore(NT("except_block")), Optional(NT("else_block")), Optional(NT("finally_block"))),
      Sequence(K("try"), T(":"), NT("block"), OneOrMore(NT("except_star_block")), Optional(NT("else_block")), Optional(NT("finally_block")))
    )
  )
);

rules.set("except_block", () =>
  Diagram(
    Choice(0,
      Sequence(K("except"), NT("expression"), T(":"), NT("block")),
      Sequence(K("except"), NT("expression"), K("as"), T("NAME"), T(":"), NT("block")),
      Sequence(K("except"), NT("expressions"), T(":"), NT("block")),
      Sequence(K("except"), T(":"), NT("block"))
    )
  )
);

rules.set("except_star_block", () =>
  Diagram(
    Choice(0,
      Sequence(K("except"), T("*"), NT("expression"), T(":"), NT("block")),
      Sequence(K("except"), T("*"), NT("expression"), K("as"), T("NAME"), T(":"), NT("block")),
      Sequence(K("except"), T("*"), NT("expressions"), T(":"), NT("block"))
    )
  )
);

rules.set("finally_block", () =>
  Diagram(Sequence(K("finally"), T(":"), NT("block")))
);

// ===== MATCH STATEMENT =====

rules.set("match_stmt", () =>
  Diagram(
    Sequence(
      SK("match"),
      NT("subject_expr"),
      T(":"),
      T("NEWLINE"),
      T("INDENT"),
      OneOrMore(NT("case_block")),
      T("DEDENT")
    )
  )
);

rules.set("subject_expr", () =>
  Diagram(
    Choice(0,
      Sequence(NT("star_named_expression"), T(","), Optional(NT("star_named_expressions"))),
      NT("named_expression")
    )
  )
);

rules.set("case_block", () =>
  Diagram(
    Sequence(SK("case"), NT("patterns"), Optional(NT("guard")), T(":"), NT("block"))
  )
);

rules.set("guard", () =>
  Diagram(Sequence(K("if"), NT("named_expression")))
);

rules.set("patterns", () =>
  Diagram(
    Choice(0,
      NT("open_sequence_pattern"),
      NT("pattern")
    )
  )
);

rules.set("pattern", () =>
  Diagram(
    Choice(0,
      NT("as_pattern"),
      NT("or_pattern")
    )
  )
);

rules.set("as_pattern", () =>
  Diagram(
    Sequence(NT("or_pattern"), K("as"), NT("pattern_capture_target"))
  )
);

rules.set("or_pattern", () =>
  Diagram(
    Sequence(
      NT("closed_pattern"),
      ZeroOrMore(Sequence(T("|"), NT("closed_pattern")))
    )
  )
);

rules.set("closed_pattern", () =>
  Diagram(
    Choice(0,
      NT("literal_pattern"),
      NT("capture_pattern"),
      NT("wildcard_pattern"),
      NT("value_pattern"),
      NT("group_pattern"),
      NT("sequence_pattern"),
      NT("mapping_pattern"),
      NT("class_pattern")
    )
  )
);

rules.set("literal_pattern", () =>
  Diagram(
    Choice(0,
      NT("signed_number"),
      NT("complex_number"),
      NT("strings"),
      K("None"),
      K("True"),
      K("False")
    )
  )
);

rules.set("literal_expr", () =>
  Diagram(
    Choice(0,
      NT("signed_number"),
      NT("complex_number"),
      NT("strings"),
      K("None"),
      K("True"),
      K("False")
    )
  )
);

rules.set("complex_number", () =>
  Diagram(
    Choice(0,
      Sequence(NT("signed_real_number"), T("+"), NT("imaginary_number")),
      Sequence(NT("signed_real_number"), T("-"), NT("imaginary_number"))
    )
  )
);

rules.set("signed_number", () =>
  Diagram(
    Choice(0,
      T("NUMBER"),
      Sequence(T("-"), T("NUMBER"))
    )
  )
);

rules.set("signed_real_number", () =>
  Diagram(
    Choice(0,
      NT("real_number"),
      Sequence(T("-"), NT("real_number"))
    )
  )
);

rules.set("real_number", () =>
  Diagram(T("NUMBER"))
);

rules.set("imaginary_number", () =>
  Diagram(T("NUMBER"))
);

rules.set("capture_pattern", () =>
  Diagram(NT("pattern_capture_target"))
);

rules.set("pattern_capture_target", () =>
  Diagram(
    Sequence(T("NAME"), Comment("not '_', not followed by '.', '(', or '='"))
  )
);

rules.set("wildcard_pattern", () =>
  Diagram(T("_"))
);

rules.set("value_pattern", () =>
  Diagram(NT("attr"))
);

rules.set("attr", () =>
  Diagram(
    Sequence(NT("name_or_attr"), T("."), T("NAME"))
  )
);

rules.set("name_or_attr", () =>
  Diagram(
    Choice(0, NT("attr"), T("NAME"))
  )
);

rules.set("group_pattern", () =>
  Diagram(Sequence(T("("), NT("pattern"), T(")")))
);

rules.set("sequence_pattern", () =>
  Diagram(
    Choice(0,
      Sequence(T("["), Optional(NT("maybe_sequence_pattern")), T("]")),
      Sequence(T("("), Optional(NT("open_sequence_pattern")), T(")"))
    )
  )
);

rules.set("open_sequence_pattern", () =>
  Diagram(
    Sequence(NT("maybe_star_pattern"), T(","), Optional(NT("maybe_sequence_pattern")))
  )
);

rules.set("maybe_sequence_pattern", () =>
  Diagram(
    Sequence(
      NT("maybe_star_pattern"),
      ZeroOrMore(Sequence(T(","), NT("maybe_star_pattern"))),
      Optional(T(","))
    )
  )
);

rules.set("maybe_star_pattern", () =>
  Diagram(
    Choice(0, NT("star_pattern"), NT("pattern"))
  )
);

rules.set("star_pattern", () =>
  Diagram(
    Choice(0,
      Sequence(T("*"), NT("pattern_capture_target")),
      Sequence(T("*"), NT("wildcard_pattern"))
    )
  )
);

rules.set("mapping_pattern", () =>
  Diagram(
    Choice(0,
      Sequence(T("{"), T("}")),
      Sequence(T("{"), NT("double_star_pattern"), Optional(T(",")), T("}")),
      Sequence(T("{"), NT("items_pattern"), T(","), NT("double_star_pattern"), Optional(T(",")), T("}")),
      Sequence(T("{"), NT("items_pattern"), Optional(T(",")), T("}"))
    )
  )
);

rules.set("items_pattern", () =>
  Diagram(
    Sequence(
      NT("key_value_pattern"),
      ZeroOrMore(Sequence(T(","), NT("key_value_pattern")))
    )
  )
);

rules.set("key_value_pattern", () =>
  Diagram(
    Sequence(
      Choice(0, NT("literal_expr"), NT("attr")),
      T(":"),
      NT("pattern")
    )
  )
);

rules.set("double_star_pattern", () =>
  Diagram(Sequence(T("**"), NT("pattern_capture_target")))
);

rules.set("class_pattern", () =>
  Diagram(
    Choice(0,
      Sequence(NT("name_or_attr"), T("("), T(")")),
      Sequence(NT("name_or_attr"), T("("), NT("positional_patterns"), Optional(T(",")), T(")")),
      Sequence(NT("name_or_attr"), T("("), NT("keyword_patterns"), Optional(T(",")), T(")")),
      Sequence(NT("name_or_attr"), T("("), NT("positional_patterns"), T(","), NT("keyword_patterns"), Optional(T(",")), T(")"))
    )
  )
);

rules.set("positional_patterns", () =>
  Diagram(
    Sequence(
      NT("pattern"),
      ZeroOrMore(Sequence(T(","), NT("pattern")))
    )
  )
);

rules.set("keyword_patterns", () =>
  Diagram(
    Sequence(
      NT("keyword_pattern"),
      ZeroOrMore(Sequence(T(","), NT("keyword_pattern")))
    )
  )
);

rules.set("keyword_pattern", () =>
  Diagram(Sequence(T("NAME"), T("="), NT("pattern")))
);

// ===== TYPE STATEMENT =====

rules.set("type_alias", () =>
  Diagram(
    Sequence(SK("type"), T("NAME"), Optional(NT("type_params")), T("="), NT("expression"))
  )
);

rules.set("type_params", () =>
  Diagram(Sequence(T("["), NT("type_param_seq"), T("]")))
);

rules.set("type_param_seq", () =>
  Diagram(
    Sequence(
      NT("type_param"),
      ZeroOrMore(Sequence(T(","), NT("type_param"))),
      Optional(T(","))
    )
  )
);

rules.set("type_param", () =>
  Diagram(
    Choice(0,
      Sequence(T("NAME"), Optional(NT("type_param_bound")), Optional(NT("type_param_default"))),
      Sequence(T("*"), T("NAME"), Optional(NT("type_param_starred_default"))),
      Sequence(T("**"), T("NAME"), Optional(NT("type_param_default")))
    )
  )
);

rules.set("type_param_bound", () =>
  Diagram(Sequence(T(":"), NT("expression")))
);

rules.set("type_param_default", () =>
  Diagram(Sequence(T("="), NT("expression")))
);

rules.set("type_param_starred_default", () =>
  Diagram(Sequence(T("="), NT("star_expression")))
);

// ===== EXPRESSIONS =====

rules.set("expressions", () =>
  Diagram(
    Choice(0,
      Sequence(NT("expression"), OneOrMore(Sequence(T(","), NT("expression"))), Optional(T(","))),
      Sequence(NT("expression"), T(",")),
      NT("expression")
    )
  )
);

rules.set("expression", () =>
  Diagram(
    Choice(0,
      Sequence(NT("disjunction"), K("if"), NT("disjunction"), K("else"), NT("expression")),
      NT("disjunction"),
      NT("lambdef")
    )
  )
);

rules.set("yield_expr", () =>
  Diagram(
    Choice(0,
      Sequence(K("yield"), K("from"), NT("expression")),
      Sequence(K("yield"), Optional(NT("star_expressions")))
    )
  )
);

rules.set("star_expressions", () =>
  Diagram(
    Choice(0,
      Sequence(NT("star_expression"), OneOrMore(Sequence(T(","), NT("star_expression"))), Optional(T(","))),
      Sequence(NT("star_expression"), T(",")),
      NT("star_expression")
    )
  )
);

rules.set("star_expression", () =>
  Diagram(
    Choice(0,
      Sequence(T("*"), NT("bitwise_or")),
      NT("expression")
    )
  )
);

rules.set("star_named_expressions", () =>
  Diagram(
    Sequence(
      NT("star_named_expression"),
      ZeroOrMore(Sequence(T(","), NT("star_named_expression"))),
      Optional(T(","))
    )
  )
);

rules.set("star_named_expression", () =>
  Diagram(
    Choice(0,
      Sequence(T("*"), NT("bitwise_or")),
      NT("named_expression")
    )
  )
);

rules.set("assignment_expression", () =>
  Diagram(
    Sequence(T("NAME"), T(":="), NT("expression"))
  )
);

rules.set("named_expression", () =>
  Diagram(
    Choice(0,
      NT("assignment_expression"),
      NT("expression")
    )
  )
);

rules.set("disjunction", () =>
  Diagram(
    Choice(0,
      Sequence(NT("conjunction"), OneOrMore(Sequence(K("or"), NT("conjunction")))),
      NT("conjunction")
    )
  )
);

rules.set("conjunction", () =>
  Diagram(
    Choice(0,
      Sequence(NT("inversion"), OneOrMore(Sequence(K("and"), NT("inversion")))),
      NT("inversion")
    )
  )
);

rules.set("inversion", () =>
  Diagram(
    Choice(0,
      Sequence(K("not"), NT("inversion")),
      NT("comparison")
    )
  )
);

// ===== COMPARISON OPERATORS =====

rules.set("comparison", () =>
  Diagram(
    Choice(0,
      Sequence(NT("bitwise_or"), OneOrMore(NT("compare_op_bitwise_or_pair"))),
      NT("bitwise_or")
    )
  )
);

rules.set("compare_op_bitwise_or_pair", () =>
  Diagram(
    Choice(0,
      NT("eq_bitwise_or"),
      NT("noteq_bitwise_or"),
      NT("lte_bitwise_or"),
      NT("lt_bitwise_or"),
      NT("gte_bitwise_or"),
      NT("gt_bitwise_or"),
      NT("notin_bitwise_or"),
      NT("in_bitwise_or"),
      NT("isnot_bitwise_or"),
      NT("is_bitwise_or")
    )
  )
);

rules.set("eq_bitwise_or", () =>
  Diagram(Sequence(T("=="), NT("bitwise_or")))
);

rules.set("noteq_bitwise_or", () =>
  Diagram(Sequence(T("!="), NT("bitwise_or")))
);

rules.set("lte_bitwise_or", () =>
  Diagram(Sequence(T("<="), NT("bitwise_or")))
);

rules.set("lt_bitwise_or", () =>
  Diagram(Sequence(T("<"), NT("bitwise_or")))
);

rules.set("gte_bitwise_or", () =>
  Diagram(Sequence(T(">="), NT("bitwise_or")))
);

rules.set("gt_bitwise_or", () =>
  Diagram(Sequence(T(">"), NT("bitwise_or")))
);

rules.set("notin_bitwise_or", () =>
  Diagram(Sequence(K("not"), K("in"), NT("bitwise_or")))
);

rules.set("in_bitwise_or", () =>
  Diagram(Sequence(K("in"), NT("bitwise_or")))
);

rules.set("isnot_bitwise_or", () =>
  Diagram(Sequence(K("is"), K("not"), NT("bitwise_or")))
);

rules.set("is_bitwise_or", () =>
  Diagram(Sequence(K("is"), NT("bitwise_or")))
);

// ===== BITWISE OPERATORS =====

rules.set("bitwise_or", () =>
  Diagram(
    Sequence(
      NT("bitwise_xor"),
      ZeroOrMore(Sequence(T("|"), NT("bitwise_xor")))
    )
  )
);

rules.set("bitwise_xor", () =>
  Diagram(
    Sequence(
      NT("bitwise_and"),
      ZeroOrMore(Sequence(T("^"), NT("bitwise_and")))
    )
  )
);

rules.set("bitwise_and", () =>
  Diagram(
    Sequence(
      NT("shift_expr"),
      ZeroOrMore(Sequence(T("&"), NT("shift_expr")))
    )
  )
);

rules.set("shift_expr", () =>
  Diagram(
    Sequence(
      NT("sum"),
      ZeroOrMore(Sequence(Choice(0, T("<<"), T(">>")), NT("sum")))
    )
  )
);

// ===== ARITHMETIC OPERATORS =====

rules.set("sum", () =>
  Diagram(
    Sequence(
      NT("term"),
      ZeroOrMore(Sequence(Choice(0, T("+"), T("-")), NT("term")))
    )
  )
);

rules.set("term", () =>
  Diagram(
    Sequence(
      NT("factor"),
      ZeroOrMore(Sequence(Choice(0, T("*"), T("/"), T("//"), T("%"), T("@")), NT("factor")))
    )
  )
);

rules.set("factor", () =>
  Diagram(
    Choice(0,
      Sequence(T("+"), NT("factor")),
      Sequence(T("-"), NT("factor")),
      Sequence(T("~"), NT("factor")),
      NT("power")
    )
  )
);

rules.set("power", () =>
  Diagram(
    Choice(0,
      Sequence(NT("await_primary"), T("**"), NT("factor")),
      NT("await_primary")
    )
  )
);

// ===== PRIMARY ELEMENTS =====

rules.set("await_primary", () =>
  Diagram(
    Choice(0,
      Sequence(K("await"), NT("primary")),
      NT("primary")
    )
  )
);

rules.set("primary", () =>
  Diagram(
    Sequence(
      NT("atom"),
      ZeroOrMore(
        Choice(0,
          Sequence(T("."), T("NAME")),
          NT("genexp"),
          Sequence(T("("), Optional(NT("arguments")), T(")")),
          Sequence(T("["), NT("slices"), T("]"))
        )
      )
    )
  )
);

rules.set("slices", () =>
  Diagram(
    Choice(0,
      NT("slice"),
      Sequence(
        Choice(0, NT("slice"), NT("starred_expression")),
        ZeroOrMore(Sequence(T(","), Choice(0, NT("slice"), NT("starred_expression")))),
        Optional(T(","))
      )
    )
  )
);

rules.set("slice", () =>
  Diagram(
    Choice(0,
      Sequence(
        Optional(NT("expression")),
        T(":"),
        Optional(NT("expression")),
        Optional(Sequence(T(":"), Optional(NT("expression"))))
      ),
      NT("named_expression")
    )
  )
);

rules.set("atom", () =>
  Diagram(
    Choice(0,
      T("NAME"),
      K("True"),
      K("False"),
      K("None"),
      NT("strings"),
      T("NUMBER"),
      Choice(0, NT("tuple"), NT("group"), NT("genexp")),
      Choice(0, NT("list"), NT("listcomp")),
      Choice(0, NT("dict"), NT("set"), NT("dictcomp"), NT("setcomp")),
      T("...")
    )
  )
);

rules.set("group", () =>
  Diagram(
    Sequence(T("("), Choice(0, NT("yield_expr"), NT("named_expression")), T(")"))
  )
);

// ===== LAMBDA FUNCTIONS =====

rules.set("lambdef", () =>
  Diagram(
    Sequence(K("lambda"), Optional(NT("lambda_params")), T(":"), NT("expression"))
  )
);

rules.set("lambda_params", () =>
  Diagram(NT("lambda_parameters"))
);

rules.set("lambda_parameters", () =>
  Diagram(
    Choice(0,
      Sequence(NT("lambda_slash_no_default"), ZeroOrMore(NT("lambda_param_no_default")), ZeroOrMore(NT("lambda_param_with_default")), Optional(NT("lambda_star_etc"))),
      Sequence(NT("lambda_slash_with_default"), ZeroOrMore(NT("lambda_param_with_default")), Optional(NT("lambda_star_etc"))),
      Sequence(OneOrMore(NT("lambda_param_no_default")), ZeroOrMore(NT("lambda_param_with_default")), Optional(NT("lambda_star_etc"))),
      Sequence(OneOrMore(NT("lambda_param_with_default")), Optional(NT("lambda_star_etc"))),
      NT("lambda_star_etc")
    )
  )
);

rules.set("lambda_slash_no_default", () =>
  Diagram(
    Sequence(OneOrMore(NT("lambda_param_no_default")), T("/"), Choice(0, T(","), Comment("&':'")))
  )
);

rules.set("lambda_slash_with_default", () =>
  Diagram(
    Sequence(ZeroOrMore(NT("lambda_param_no_default")), OneOrMore(NT("lambda_param_with_default")), T("/"), Choice(0, T(","), Comment("&':'")))
  )
);

rules.set("lambda_star_etc", () =>
  Diagram(
    Choice(0,
      Sequence(T("*"), NT("lambda_param_no_default"), ZeroOrMore(NT("lambda_param_maybe_default")), Optional(NT("lambda_kwds"))),
      Sequence(T("*"), T(","), OneOrMore(NT("lambda_param_maybe_default")), Optional(NT("lambda_kwds"))),
      NT("lambda_kwds")
    )
  )
);

rules.set("lambda_kwds", () =>
  Diagram(Sequence(T("**"), NT("lambda_param_no_default")))
);

rules.set("lambda_param_no_default", () =>
  Diagram(
    Sequence(NT("lambda_param"), Choice(0, T(","), Comment("&':'")))
  )
);

rules.set("lambda_param_with_default", () =>
  Diagram(
    Sequence(NT("lambda_param"), NT("default"), Choice(0, T(","), Comment("&':'")))
  )
);

rules.set("lambda_param_maybe_default", () =>
  Diagram(
    Sequence(NT("lambda_param"), Optional(NT("default")), Choice(0, T(","), Comment("&':'")))
  )
);

rules.set("lambda_param", () =>
  Diagram(T("NAME"))
);

// ===== LITERALS =====

rules.set("fstring_middle", () =>
  Diagram(
    Choice(0,
      NT("fstring_replacement_field"),
      T("FSTRING_MIDDLE")
    )
  )
);

rules.set("fstring_replacement_field", () =>
  Diagram(
    Sequence(
      T("{"),
      NT("annotated_rhs"),
      Optional(T("=")),
      Optional(NT("fstring_conversion")),
      Optional(NT("fstring_full_format_spec")),
      T("}")
    )
  )
);

rules.set("fstring_conversion", () =>
  Diagram(Sequence(T("!"), T("NAME")))
);

rules.set("fstring_full_format_spec", () =>
  Diagram(Sequence(T(":"), ZeroOrMore(NT("fstring_format_spec"))))
);

rules.set("fstring_format_spec", () =>
  Diagram(
    Choice(0,
      T("FSTRING_MIDDLE"),
      NT("fstring_replacement_field")
    )
  )
);

rules.set("fstring", () =>
  Diagram(
    Sequence(T("FSTRING_START"), ZeroOrMore(NT("fstring_middle")), T("FSTRING_END"))
  )
);

rules.set("tstring_format_spec_replacement_field", () =>
  Diagram(
    Sequence(
      T("{"),
      NT("annotated_rhs"),
      Optional(T("=")),
      Optional(NT("fstring_conversion")),
      Optional(NT("tstring_full_format_spec")),
      T("}")
    )
  )
);

rules.set("tstring_format_spec", () =>
  Diagram(
    Choice(0,
      T("TSTRING_MIDDLE"),
      NT("tstring_format_spec_replacement_field")
    )
  )
);

rules.set("tstring_full_format_spec", () =>
  Diagram(Sequence(T(":"), ZeroOrMore(NT("tstring_format_spec"))))
);

rules.set("tstring_replacement_field", () =>
  Diagram(
    Sequence(
      T("{"),
      NT("annotated_rhs"),
      Optional(T("=")),
      Optional(NT("fstring_conversion")),
      Optional(NT("tstring_full_format_spec")),
      T("}")
    )
  )
);

rules.set("tstring_middle", () =>
  Diagram(
    Choice(0,
      NT("tstring_replacement_field"),
      T("TSTRING_MIDDLE")
    )
  )
);

rules.set("tstring", () =>
  Diagram(
    Sequence(T("TSTRING_START"), ZeroOrMore(NT("tstring_middle")), T("TSTRING_END"))
  )
);

rules.set("string", () =>
  Diagram(T("STRING"))
);

rules.set("strings", () =>
  Diagram(
    Choice(0,
      OneOrMore(Choice(0, NT("fstring"), NT("string"))),
      OneOrMore(NT("tstring"))
    )
  )
);

// ===== COLLECTIONS =====

rules.set("list", () =>
  Diagram(
    Sequence(T("["), Optional(NT("star_named_expressions")), T("]"))
  )
);

rules.set("tuple", () =>
  Diagram(
    Sequence(
      T("("),
      Optional(Sequence(NT("star_named_expression"), T(","), Optional(NT("star_named_expressions")))),
      T(")")
    )
  )
);

rules.set("set", () =>
  Diagram(
    Sequence(T("{"), NT("star_named_expressions"), T("}"))
  )
);

rules.set("dict", () =>
  Diagram(
    Sequence(T("{"), Optional(NT("double_starred_kvpairs")), T("}"))
  )
);

rules.set("double_starred_kvpairs", () =>
  Diagram(
    Sequence(
      NT("double_starred_kvpair"),
      ZeroOrMore(Sequence(T(","), NT("double_starred_kvpair"))),
      Optional(T(","))
    )
  )
);

rules.set("double_starred_kvpair", () =>
  Diagram(
    Choice(0,
      Sequence(T("**"), NT("bitwise_or")),
      NT("kvpair")
    )
  )
);

rules.set("kvpair", () =>
  Diagram(Sequence(NT("expression"), T(":"), NT("expression")))
);

// ===== COMPREHENSIONS & GENERATORS =====

rules.set("for_if_clauses", () =>
  Diagram(OneOrMore(NT("for_if_clause")))
);

rules.set("for_if_clause", () =>
  Diagram(
    Choice(0,
      Sequence(K("async"), K("for"), NT("star_targets"), K("in"), NT("disjunction"), ZeroOrMore(Sequence(K("if"), NT("disjunction")))),
      Sequence(K("for"), NT("star_targets"), K("in"), NT("disjunction"), ZeroOrMore(Sequence(K("if"), NT("disjunction"))))
    )
  )
);

rules.set("listcomp", () =>
  Diagram(
    Sequence(T("["), NT("named_expression"), NT("for_if_clauses"), T("]"))
  )
);

rules.set("setcomp", () =>
  Diagram(
    Sequence(T("{"), NT("named_expression"), NT("for_if_clauses"), T("}"))
  )
);

rules.set("genexp", () =>
  Diagram(
    Sequence(
      T("("),
      Choice(0, NT("assignment_expression"), NT("expression")),
      NT("for_if_clauses"),
      T(")")
    )
  )
);

rules.set("dictcomp", () =>
  Diagram(
    Sequence(T("{"), NT("kvpair"), NT("for_if_clauses"), T("}"))
  )
);

// ===== FUNCTION CALL ARGUMENTS =====

rules.set("arguments", () =>
  Diagram(
    Sequence(NT("args"), Optional(T(",")))
  )
);

rules.set("args", () =>
  Diagram(
    Choice(0,
      Sequence(
        Choice(0, NT("starred_expression"), NT("assignment_expression"), NT("expression")),
        ZeroOrMore(Sequence(T(","), Choice(0, NT("starred_expression"), NT("assignment_expression"), NT("expression")))),
        Optional(Sequence(T(","), NT("kwargs")))
      ),
      NT("kwargs")
    )
  )
);

rules.set("kwargs", () =>
  Diagram(
    Choice(0,
      Sequence(
        NT("kwarg_or_starred"),
        ZeroOrMore(Sequence(T(","), NT("kwarg_or_starred"))),
        T(","),
        NT("kwarg_or_double_starred"),
        ZeroOrMore(Sequence(T(","), NT("kwarg_or_double_starred")))
      ),
      Sequence(NT("kwarg_or_starred"), ZeroOrMore(Sequence(T(","), NT("kwarg_or_starred")))),
      Sequence(NT("kwarg_or_double_starred"), ZeroOrMore(Sequence(T(","), NT("kwarg_or_double_starred"))))
    )
  )
);

rules.set("starred_expression", () =>
  Diagram(Sequence(T("*"), NT("expression")))
);

rules.set("kwarg_or_starred", () =>
  Diagram(
    Choice(0,
      Sequence(T("NAME"), T("="), NT("expression")),
      NT("starred_expression")
    )
  )
);

rules.set("kwarg_or_double_starred", () =>
  Diagram(
    Choice(0,
      Sequence(T("NAME"), T("="), NT("expression")),
      Sequence(T("**"), NT("expression"))
    )
  )
);

// ===== ASSIGNMENT TARGETS =====

rules.set("star_targets", () =>
  Diagram(
    Choice(0,
      NT("star_target"),
      Sequence(NT("star_target"), ZeroOrMore(Sequence(T(","), NT("star_target"))), Optional(T(",")))
    )
  )
);

rules.set("star_targets_list_seq", () =>
  Diagram(
    Sequence(NT("star_target"), ZeroOrMore(Sequence(T(","), NT("star_target"))), Optional(T(",")))
  )
);

rules.set("star_targets_tuple_seq", () =>
  Diagram(
    Choice(0,
      Sequence(NT("star_target"), OneOrMore(Sequence(T(","), NT("star_target"))), Optional(T(","))),
      Sequence(NT("star_target"), T(","))
    )
  )
);

rules.set("star_target", () =>
  Diagram(
    Choice(0,
      Sequence(T("*"), NT("star_target")),
      NT("target_with_star_atom")
    )
  )
);

rules.set("target_with_star_atom", () =>
  Diagram(
    Choice(0,
      Sequence(NT("t_primary"), T("."), T("NAME")),
      Sequence(NT("t_primary"), T("["), NT("slices"), T("]")),
      NT("star_atom")
    )
  )
);

rules.set("star_atom", () =>
  Diagram(
    Choice(0,
      T("NAME"),
      Sequence(T("("), NT("target_with_star_atom"), T(")")),
      Sequence(T("("), Optional(NT("star_targets_tuple_seq")), T(")")),
      Sequence(T("["), Optional(NT("star_targets_list_seq")), T("]"))
    )
  )
);

rules.set("single_target", () =>
  Diagram(
    Choice(0,
      NT("single_subscript_attribute_target"),
      T("NAME"),
      Sequence(T("("), NT("single_target"), T(")"))
    )
  )
);

rules.set("single_subscript_attribute_target", () =>
  Diagram(
    Choice(0,
      Sequence(NT("t_primary"), T("."), T("NAME")),
      Sequence(NT("t_primary"), T("["), NT("slices"), T("]"))
    )
  )
);

rules.set("t_primary", () =>
  Diagram(
    Sequence(
      NT("atom"),
      ZeroOrMore(
        Choice(0,
          Sequence(T("."), T("NAME")),
          Sequence(T("["), NT("slices"), T("]")),
          NT("genexp"),
          Sequence(T("("), Optional(NT("arguments")), T(")"))
        )
      ),
      Comment("&t_lookahead")
    )
  )
);

rules.set("t_lookahead", () =>
  Diagram(Choice(0, T("("), T("["), T(".")))
);

// ===== DEL TARGETS =====

rules.set("del_targets", () =>
  Diagram(
    Sequence(NT("del_target"), ZeroOrMore(Sequence(T(","), NT("del_target"))), Optional(T(",")))
  )
);

rules.set("del_target", () =>
  Diagram(
    Choice(0,
      Sequence(NT("t_primary"), T("."), T("NAME")),
      Sequence(NT("t_primary"), T("["), NT("slices"), T("]")),
      NT("del_t_atom")
    )
  )
);

rules.set("del_t_atom", () =>
  Diagram(
    Choice(0,
      T("NAME"),
      Sequence(T("("), NT("del_target"), T(")")),
      Sequence(T("("), Optional(NT("del_targets")), T(")")),
      Sequence(T("["), Optional(NT("del_targets")), T("]"))
    )
  )
);

// ===== TYPING ELEMENTS =====

rules.set("type_expressions", () =>
  Diagram(
    Choice(0,
      Sequence(NT("expression"), ZeroOrMore(Sequence(T(","), NT("expression"))), T(","), T("*"), NT("expression"), T(","), T("**"), NT("expression")),
      Sequence(NT("expression"), ZeroOrMore(Sequence(T(","), NT("expression"))), T(","), T("*"), NT("expression")),
      Sequence(NT("expression"), ZeroOrMore(Sequence(T(","), NT("expression"))), T(","), T("**"), NT("expression")),
      Sequence(T("*"), NT("expression"), T(","), T("**"), NT("expression")),
      Sequence(T("*"), NT("expression")),
      Sequence(T("**"), NT("expression")),
      Sequence(NT("expression"), ZeroOrMore(Sequence(T(","), NT("expression"))))
    )
  )
);

rules.set("func_type_comment", () =>
  Diagram(
    Choice(0,
      Sequence(T("NEWLINE"), T("TYPE_COMMENT")),
      T("TYPE_COMMENT")
    )
  )
);

// --- React/TS integration exports --------------------------------------------

export type SectionId = "starting" | "statements" | "simple_stmts" | "imports" | "compound" | "params" | "control" | "match" | "types" | "expressions" | "comparison" | "bitwise" | "arithmetic" | "primary" | "lambda" | "literals" | "collections" | "comprehensions" | "arguments" | "targets" | "typing";
export type RuleName = string;

export const SECTION_ORDER: SectionId[] = [
  "starting",
  "statements",
  "simple_stmts",
  "imports",
  "compound",
  "params",
  "control",
  "match",
  "types",
  "expressions",
  "comparison",
  "bitwise",
  "arithmetic",
  "primary",
  "lambda",
  "literals",
  "collections",
  "comprehensions",
  "arguments",
  "targets",
  "typing"
];

export const SECTION_TITLES: Record<SectionId, string> = {
  starting: "Starting Rules",
  statements: "General Statements",
  simple_stmts: "Simple Statements",
  imports: "Import Statements",
  compound: "Compound Statements",
  params: "Function Parameters",
  control: "Control Flow (if/while/for/with/try)",
  match: "Pattern Matching",
  types: "Type Statements",
  expressions: "Expressions",
  comparison: "Comparison Operators",
  bitwise: "Bitwise Operators",
  arithmetic: "Arithmetic Operators",
  primary: "Primary Elements",
  lambda: "Lambda Functions",
  literals: "Literals",
  collections: "Collections",
  comprehensions: "Comprehensions & Generators",
  arguments: "Function Call Arguments",
  targets: "Assignment Targets",
  typing: "Typing Elements"
};

export const SECTION_RULES: Record<SectionId, RuleName[]> = {
  "starting": [
    "file",
    "interactive",
    "eval",
    "func_type"
  ],
  "statements": [
    "statements",
    "statement",
    "statement_newline",
    "simple_stmts",
    "simple_stmt",
    "compound_stmt"
  ],
  "simple_stmts": [
    "assignment",
    "annotated_rhs",
    "augassign",
    "return_stmt",
    "raise_stmt",
    "pass_stmt",
    "break_stmt",
    "continue_stmt",
    "global_stmt",
    "nonlocal_stmt",
    "del_stmt",
    "yield_stmt",
    "assert_stmt"
  ],
  "imports": [
    "import_stmt",
    "import_name",
    "import_from",
    "import_from_targets",
    "import_from_as_names",
    "import_from_as_name",
    "dotted_as_names",
    "dotted_as_name",
    "dotted_name"
  ],
  "compound": [
    "block",
    "decorators",
    "class_def",
    "class_def_raw",
    "function_def",
    "function_def_raw"
  ],
  "params": [
    "params",
    "parameters",
    "slash_no_default",
    "slash_with_default",
    "star_etc",
    "kwds",
    "param_no_default",
    "param_no_default_star_annotation",
    "param_with_default",
    "param_maybe_default",
    "param",
    "param_star_annotation",
    "annotation",
    "star_annotation",
    "default"
  ],
  "control": [
    "if_stmt",
    "elif_stmt",
    "else_block",
    "while_stmt",
    "for_stmt",
    "with_stmt",
    "with_item",
    "try_stmt",
    "except_block",
    "except_star_block",
    "finally_block"
  ],
  "match": [
    "match_stmt",
    "subject_expr",
    "case_block",
    "guard",
    "patterns",
    "pattern",
    "as_pattern",
    "or_pattern",
    "closed_pattern",
    "literal_pattern",
    "literal_expr",
    "complex_number",
    "signed_number",
    "signed_real_number",
    "real_number",
    "imaginary_number",
    "capture_pattern",
    "pattern_capture_target",
    "wildcard_pattern",
    "value_pattern",
    "attr",
    "name_or_attr",
    "group_pattern",
    "sequence_pattern",
    "open_sequence_pattern",
    "maybe_sequence_pattern",
    "maybe_star_pattern",
    "star_pattern",
    "mapping_pattern",
    "items_pattern",
    "key_value_pattern",
    "double_star_pattern",
    "class_pattern",
    "positional_patterns",
    "keyword_patterns",
    "keyword_pattern"
  ],
  "types": [
    "type_alias",
    "type_params",
    "type_param_seq",
    "type_param",
    "type_param_bound",
    "type_param_default",
    "type_param_starred_default"
  ],
  "expressions": [
    "expressions",
    "expression",
    "yield_expr",
    "star_expressions",
    "star_expression",
    "star_named_expressions",
    "star_named_expression",
    "assignment_expression",
    "named_expression",
    "disjunction",
    "conjunction",
    "inversion"
  ],
  "comparison": [
    "comparison",
    "compare_op_bitwise_or_pair",
    "eq_bitwise_or",
    "noteq_bitwise_or",
    "lte_bitwise_or",
    "lt_bitwise_or",
    "gte_bitwise_or",
    "gt_bitwise_or",
    "notin_bitwise_or",
    "in_bitwise_or",
    "isnot_bitwise_or",
    "is_bitwise_or"
  ],
  "bitwise": [
    "bitwise_or",
    "bitwise_xor",
    "bitwise_and",
    "shift_expr"
  ],
  "arithmetic": [
    "sum",
    "term",
    "factor",
    "power"
  ],
  "primary": [
    "await_primary",
    "primary",
    "slices",
    "slice",
    "atom",
    "group"
  ],
  "lambda": [
    "lambdef",
    "lambda_params",
    "lambda_parameters",
    "lambda_slash_no_default",
    "lambda_slash_with_default",
    "lambda_star_etc",
    "lambda_kwds",
    "lambda_param_no_default",
    "lambda_param_with_default",
    "lambda_param_maybe_default",
    "lambda_param"
  ],
  "literals": [
    "fstring_middle",
    "fstring_replacement_field",
    "fstring_conversion",
    "fstring_full_format_spec",
    "fstring_format_spec",
    "fstring",
    "tstring_format_spec_replacement_field",
    "tstring_format_spec",
    "tstring_full_format_spec",
    "tstring_replacement_field",
    "tstring_middle",
    "tstring",
    "string",
    "strings"
  ],
  "collections": [
    "list",
    "tuple",
    "set",
    "dict",
    "double_starred_kvpairs",
    "double_starred_kvpair",
    "kvpair"
  ],
  "comprehensions": [
    "for_if_clauses",
    "for_if_clause",
    "listcomp",
    "setcomp",
    "genexp",
    "dictcomp"
  ],
  "arguments": [
    "arguments",
    "args",
    "kwargs",
    "starred_expression",
    "kwarg_or_starred",
    "kwarg_or_double_starred"
  ],
  "targets": [
    "star_targets",
    "star_targets_list_seq",
    "star_targets_tuple_seq",
    "star_target",
    "target_with_star_atom",
    "star_atom",
    "single_target",
    "single_subscript_attribute_target",
    "t_primary",
    "t_lookahead",
    "del_targets",
    "del_target",
    "del_t_atom"
  ],
  "typing": [
    "type_expressions",
    "func_type_comment"
  ]
};

// Expose safe accessors for React UI.
export function getRuleFactory(name: RuleName): (() => any) | undefined {
  return rules.get(name);
}

export function createRuleDiagram(name: RuleName): any {
  const factory = rules.get(name);
  if (!factory) {
    return Diagram(Comment(`No factory defined for ${name}`));
  }
  return factory();
}
