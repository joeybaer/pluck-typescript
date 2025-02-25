export type ConnectOptions = {
  /**
   * if set to infinity, callers may not override (the function will be durable)
   */
  ttl?: string;
  /**
   * the task queue for the connected function for greater specificity
   */
  taskQueue?: string;
  /**
   * prefix for the workflowId (defaults to entity value if not provided)
   */
  prefix?: string; 
  /**
   * optional namespace for the the worker; how it appears in Redis (defaults to 'durable')
   */
  namespace?: string; //optional namespace for the workflowId (defaults to 'durable')
  /**
   * extended worker options
   */
  options?: WorkerOptions;
  /**
   * optional search configuration
   */
  search?: WorkflowSearchOptions;
};

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type WorkerOptions = {
  /**
   * debug, info, warn, error
   */
  logLevel?: LogLevel;
  /**
   * 1-3 (10ms, 100ms, 1_000ms)
   */
  maxSystemRetries?: number;
  /**
   * 1-3 (10ms, 100ms, 1_000ms)
   */
  backoffCoefficient?: number; //2-10ish
};

export type SearchResults = {
  /**
   * the total number of results
   */
  count: number,
  /**
   * the raw FT.SEARCH query string
   */
  query: string,
  /**
   * the raw FT.SEARCH results as an array of objects
   */
  data: StringStringType[]
};

export type WorkflowContext = {
  /**
   * the reentrant semaphore, incremented in real-time as idempotent statements are re-traversed upon reentry. Indicates the current semaphore count.
   */
  counter: number;
  /**
   * number as string for the replay cursor
   */
  cursor: string;
  /**
   * the replay hash of name/value pairs representing prior executions
   */
  replay: StringStringType;
  /**
   * the HotMesh App namespace. `durable` is the default.
   */
  namespace: string;
  /**
   * the workflow/job ID
   */
  workflowId: string;
  /**
   * the dimensional isolation for the reentrant hook, expressed in the format `0,0`, `0,1`, etc
   */
  workflowDimension: string;
  /**
   * a concatenation of the task queue and workflow name (e.g., `${taskQueueName}-${workflowName}`)
   */
  workflowTopic: string;
  /**
   * the open telemetry trace context for the workflow, used for logging and tracing. If a sink is enabled, this will be sent to the sink.
   */
  workflowTrace: string;
  /**
   * the open telemetry span context for the workflow, used for logging and tracing. If a sink is enabled, this will be sent to the sink.
   */
  workflowSpan: string;
};

export type WorkflowSearchOptions = {
  /**
   * FT index name (myapp:myindex)
   */
  index?: string;
  /**
   * FT prefixes (['myapp:myindex:prefix1', 'myapp:myindex:prefix2'])
   */
  prefix?: string[];
  /**
   * FT field types (TEXT, NUMERIC, TAG)
   */
  schema?: Record<string, {type: 'TEXT' | 'NUMERIC' | 'TAG', sortable?: boolean}>;
  /**
   * data to seed the search space
   */
  data?: Record<string, string>;
}

/**
 * Connect a function to the operational data layer.
 * @template T - the return type of the connected function
 */
export type ConnectionInput<T> = {
  /**
   * The connected function's entity identifier
   * 
   * @example
   * user
   */
  entity: string;
  /**
   * The target function reference
   * 
   * @example
   * function() { return "hello world" }
   */
  target: (...args: any[]) => T;
  /**
   * Extended connection options (e.g., ttl, taskQueue)
   * @example
   * { ttl: 'infinity' }
   */
  options?: ConnectOptions;
};

/**
 * Executes a remote function by its global entity identifier with specified arguments.
 * If options.ttl is infinity, the function will be cached indefinitely and can only be
 * removed by calling `flush`. During this time, the function will remain active and can
 * its state can be augmented by calling `set`, `incr`, `del`, etc OR by calling a
 * transactional 'hook' function.
 * 
 * @template T The expected return type of the remote function.
 */
export type ExecInput = {
  /**
   * the connected function's entity identifier
   * @example
   * user
   */
  entity: string;
  /**
   * the function's input arguments
   * @example
   * ['Jane', 'Doe']
   */
  args: any[];
  /**
   * Extended options for the hook function, like specifying a taskQueue or ttl
   * @example
   * { ttl: '5 minutes' }
   */
  options?: Partial<WorkflowOptions>;
};

/**
 * Hook function inputs. Hooks augment running jobs.
 */
export type HookInput = {
  /**
   * The target function's entity identifier
   * @example 'user'
   */
  entity: string;
  /**
   * The target execution id (workflowId/jobId)
   * @example 'jsmith123'
   */
  id: string;
  /**
   * The hook function's entity identifier
   * @example 'user.notify'
   */
  hookEntity: string;
  /**
   * The hook function's input arguments
   * @example 'notify'
   */
  hookArgs: any[];
  /**
   * Extended options for the hook function, like specifying a taskQueue
   * @example { taskQueue: 'priority' }
   */
  options?: Partial<HookOptions>;
};

export type WorkflowOptions = {
  /**
   * The app deployment namespace; how it appears in redis (e.g., 'durable')
   */
  namespace?: string;
  /**
   * Target connected functions more specifically by taskQueue
   */
  taskQueue?: string;
  /**
   * The connected function's entity identifier
   */
  prefix?: string;
  /**
   * The function execution id (shorthand for workflowId)
   */
  id?: string;
  /**
   * The function execution id
   */
  workflowId?: string;
  /**
   * The function name (`entity` is a shorthand for this)
   */
  workflowName?: string;
  /**
   * The open telemetry trace context for the workflow, used for logging and tracing. If a sink is enabled, this will be sent to the sink.
   */
  workflowTrace?: string;
  /**
   * The open telemetry span context for the workflow, used for logging and tracing. If a sink is enabled, this will be sent to the sink.
   */
  workflowSpan?: string;
  /**
   * Search fields to seed function state when it first initializes
   */
  search?: WorkflowSearchOptions;
  /**
   * Extended execution options
   */
  config?: WorkflowConfig;
  /**
   * Set to 'infinity' to make the function durable; otherwise, '1 minute', '1 hour', etc
   */
  ttl?: string;
};

export type HookOptions = {
  namespace?: string;
  taskQueue?: string;
  entity?: string;
  workflowId?: string;
  workflowName?: string;
  config?: WorkflowConfig;
};

export type SignalOptions = {
  taskQueue: string;
  data: Record<string, any>;
  workflowId: string;
  workflowName?: string;
};

export type WorkflowConfig = {
  initialInterval?: string;
};

export type CallOptions = {
  /**
   * if provided along with a `ttl`, the function will be cached
   */
  id?: string;
  /**
   * in format '1 minute', '5 minutes', '1 hour', 'infinity', etc
   */
  ttl?: string;
  /**
   * full GUID (including prefix)
   */
  $guid?: string;
  /**
   * exec, hook, proxy
   */
  $type?: string;
  /**
   * if set to false explicitly it will not await the result
   */
  await?: boolean;
  /**
   * taskQueue for the workflowId (defaults to entity)
   */
  taskQueue?: string;
  /**
   * defaults to `entity` input parameter; allows override of the workflowId prefix
   */
  prefix?: string;
  search?: WorkflowSearchOptions;
  /**
   * list of  state field names to return (this is NOT the final response)
   */
  fields?: string[];
  /**
   * namespace for the the execution client; how it appears in Redis (defaults to 'durable')
   */
  namespace?: string; //optional namespace for the workflowId (defaults to 'durable')
  flush?: boolean;
};

export type StringAnyType = {
  [key: string]: any;
};

export type Model = {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    required?: boolean;
    default?: any;
    nullable?: boolean; //if true, the field can be set to null
  };
};

export type StringStringType = {
  [key: string]: string;
};

export type JobData = Record<string, unknown | Record<string, unknown>>;

export type ActivityData = {
    data: Record<string, unknown>;
    metadata?: Record<string, unknown>;
};

export type JobMetadata = {
    key?: string;
    jid: string;
    gid: string;
    dad: string;
    aid: string;
    pj?: string;
    pg?: string;
    pd?: string;
    pa?: string;
    ngn?: string;
    app: string;
    vrs: string;
    tpc: string;
    ts: string;
    jc: string;
    ju: string;
    js: JobStatus;
    atp: string;
    stp: string;
    spn: string;
    trc: string;
    err?: string;
    expire?: number;
};

export type JobInterruptOptions = {
  /**
   * Optional reason when throwing the error 
   */
  reason?: string;
  /**
   * default is `true` when `undefined` (throw JobInterrupted/410 error)
   */
  throw?: boolean;
  /** 
   * default behavior is `false` when `undefined` (do NOT interrupt child jobs)
   */
  descend?: boolean;
  /**
   * default is false; if true, errors related to inactivation (like overage...already inactive) are suppressed/ignored
   */
  suppress?: boolean;
  /**
   * how long to wait in seconds before fully expiring/removing the hash from Redis; 
   * the job is inactive, but can remain in the cache indefinitely;
   * minimum 1 second
   */
  expire?: number;
};


export type JobStatus = number;

export type JobState = {
    metadata: JobMetadata;
    data: JobData;
    [activityId: symbol]: {
        input: ActivityData;
        output: ActivityData;
        hook: ActivityData;
        settings: ActivityData;
        errors: ActivityData;
    };
};
export type JobOutput = {
    metadata: JobMetadata;
    data: JobData;
};

export type RollCallOptions = {
  delay?: number;
  namespace?: string;
};

export type SubscriptionOptions = {
  namespace?: string;
};

export type FindJobsOptions = {
  match?: string; //Redis match for use with SCAN
  namespace?: string;
  limit?: number;
  batch?: number;
  cursor?: string;
};

export type ThrottleOptions = {
  /** target an engine OR worker by GUID */
  guid?: string;
  /** target a worker quorum */
  topic?: string;
  /** in milliseconds; default is 0 */
  throttle: number;
  /** application namespace */
  namespace?: string;
};


export type FindWhereQuery = {
  field: string;
  is: '=' | '==' | '>=' | '<=' | '[]';
  value: string | boolean | number | [number, number];
  type?: string;
};

export type FindOptions = {
  workflowName?: string;
  taskQueue?: string;
  namespace?: string;
  index?: string;
  search?: WorkflowSearchOptions
};

export type FindWhereOptions = {
  options?: FindOptions;
  count?: boolean;
  /** if null or empty, all index results will be paginated/returned. */
  query?: FindWhereQuery[] | string;
  return?: string[];
  limit?: {
      start: number;
      size: number;
  };
};
export interface ActivityAction {
  action: string;
  target: string;
}
export interface JobTimeline {
  activity: string;
  dimension: string;
  duplex: 'entry' | 'exit';
  timestamp: string;
  actions?: ActivityAction[];
}
export interface DependencyExport {
  type: string;
  topic: string;
  gid: string;
  jid: string;
}
export interface ExportTransitions {
  [key: string]: string[];
}
export interface ExportCycles {
  [key: string]: string[];
}

export interface DurableJobExport {
  data: StringAnyType;
  dependencies: DependencyExport[];
  state: StringAnyType;
  status: string;
  timeline: JobTimeline[];
  transitions: ExportTransitions;
  cycles: ExportCycles;
};

export interface QuorumMessageCallback {
  (topic: string, message: QuorumMessage): void;
}

export type QuorumMessage = StringAnyType;
