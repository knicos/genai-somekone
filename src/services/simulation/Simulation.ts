import {
    ActionLogService,
    anonUsername,
    ContentNodeId,
    embeddingSimilarity,
    RecommendationOptions,
    RecommenderService,
    UserNodeId,
} from '@knicos/genai-recom';

interface MinMax {
    min: number;
    max: number;
}

export interface SimulationOptions extends RecommendationOptions {
    tick?: number;
    duration?: number;
    onTick?: (step: number) => void;
    onEnd?: () => void;
}

export type AgentMechanism = 'random' | 'top' | 'score';

export interface AgentOptions {
    thresholds: MinMax;
}

interface Agent {
    id: UserNodeId;
    threshold: number;
    ideal: ContentNodeId;
}

export default class Simulation {
    private recommender: RecommenderService;
    private actionLog: ActionLogService;
    private agents: Agent[] = [];
    private interval = -1;
    private time = Date.now();
    private counter = 0;

    constructor(recommender: RecommenderService, actionLog: ActionLogService) {
        this.recommender = recommender;
        this.actionLog = actionLog;
    }

    public createAgents(count: number, options: AgentOptions) {
        const allContent = this.recommender.content.getAllContent();

        for (let i = 0; i < count; ++i) {
            const id: UserNodeId = `user:sim-${i}`;
            if (!this.recommender.graph.hasNode(id)) {
                this.recommender.profiler.createUserProfile(id, anonUsername());
            }

            const agent: Agent = {
                ideal: allContent[Math.floor(Math.random() * allContent.length)],
                id,
                threshold: Math.random() * (options.thresholds.max - options.thresholds.min) + options.thresholds.min,
            };
            this.agents.push(agent);
        }
    }

    public clearAgents() {
        this.agents = [];
    }

    public simulate(options: SimulationOptions) {
        //this.recommender.profiler.coldStartThreshold = 4;
        this.stop();
        this.interval = window.setInterval(() => {
            this.step(options);
            if (options.onTick) options.onTick(this.counter);
            if (options.duration !== undefined) {
                if (this.counter > options.duration) {
                    this.stop();
                    if (options.onEnd) options.onEnd();
                }
            }
        }, options?.tick || 1000);
    }

    private step(options: RecommendationOptions) {
        this.counter += 5;
        const o: RecommendationOptions = { ...options, coldStart: true };
        this.agents.forEach((agent) => {
            this.recommender.generateNewRecommendations(agent.id, 5, o);
            const recommendations = this.recommender.getRecommendations(agent.id, 5, o);

            recommendations.forEach((recommendation) => {
                const dist = embeddingSimilarity(
                    this.recommender.content.getContentMetadata(recommendation.contentId)?.embedding || [],
                    this.recommender.content.getContentMetadata(agent.ideal)?.embedding || []
                );

                const engaged = dist >= agent.threshold;

                this.actionLog.addLogEntry(
                    { activity: 'seen', id: recommendation.contentId, timestamp: this.time },
                    agent.id
                );

                if (engaged) {
                    this.actionLog.addLogEntry(
                        {
                            activity: 'dwell',
                            id: recommendation.contentId,
                            value: 2000 + 8000 * ((dist - agent.threshold) / (1 - agent.threshold)),
                            timestamp: this.time,
                        },
                        agent.id
                    );
                } else {
                    this.actionLog.addLogEntry(
                        {
                            activity: 'dwell',
                            id: recommendation.contentId,
                            value: Math.floor(Math.random() * 1999),
                            timestamp: this.time,
                        },
                        agent.id
                    );
                }
                this.actionLog.createEngagementEntry(agent.id, recommendation.contentId);
                this.time += 100;
            });
        });
    }

    public stop() {
        if (this.interval >= 0) {
            clearInterval(this.interval);
            this.interval = -1;
            this.time = 0;
        }
    }
}
