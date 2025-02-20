.PHONY: hooks
hooks:
	chmod +x ci/hooks/install-hooks.sh && sh ci/hooks/install-hooks.sh

.PHONY: ts-prune
ts-prune:
	chmod +x ci/hooks/check-unused.sh
	sh ci/hooks/check-unused.sh