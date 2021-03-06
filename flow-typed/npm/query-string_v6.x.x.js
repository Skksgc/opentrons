// flow-typed signature: 838b7a060376a8e2a352539b8e8767c0
// flow-typed version: 5a27c71dcd/query-string_v6.x.x/flow_>=v0.32.x

declare module 'query-string' {
  declare type ArrayFormat = 'none' | 'bracket' | 'index'
  declare type ParseOptions = {|
    arrayFormat?: ArrayFormat,
  |}

  declare type StringifyOptions = {|
    arrayFormat?: ArrayFormat,
    encode?: boolean,
    strict?: boolean,
    sort?: false | <A, B>(A, B) => number,
  |}

  declare type ObjectParameter = string | number | boolean | null | void;

  declare type ObjectParameters = $ReadOnly<{
    [string]: ObjectParameter | $ReadOnlyArray<ObjectParameter>
  }>

  // TODO(mc, 2019-03-28): return type can also be Array<string> if
  //   options.arrayFormat is set. We don't use this option, so I've removed
  //   the array type for simplicity
  declare type QueryParameters = {
    [string]: string | null | void
  }

  declare module.exports: {
    extract(str: string): string,
    parse(str: string, opts?: ParseOptions): QueryParameters,
    parseUrl(str: string, opts?: ParseOptions): { url: string, query: QueryParameters },
    stringify(obj: ObjectParameters, opts?: StringifyOptions): string,
  }
}
