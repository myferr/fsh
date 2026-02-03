#!/bin/bash

set -e

IMAGE_NAME=${IMAGE_NAME:-backend}
TAG=${TAG:-latest}
REGISTRY=${REGISTRY:-docker.io}

echo "Building Docker image..."
docker build -t "${IMAGE_NAME}:${TAG}" .

echo "Tagging image..."
docker tag "${IMAGE_NAME}:${TAG}" "${REGISTRY}/${IMAGE_NAME}:${TAG}"

echo "Pushing image to registry..."
docker push "${REGISTRY}/${IMAGE_NAME}:${TAG}"

echo "Successfully published ${REGISTRY}/${IMAGE_NAME}:${TAG}"